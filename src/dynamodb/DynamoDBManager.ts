/*
 * Copyright 2010-2013 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 * 
 *  http://aws.amazon.com/apache2.0
 * 
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import { GeoDataManagerConfiguration } from "../GeoDataManagerConfiguration";
import { AWSError, DynamoDB, Request } from "aws-sdk";
import {
  BatchWritePointOutput,
  PutPointInput,
  PutPointOutput,
  UpdatePointInput,
  UpdatePointOutput
} from "../types";
import { S2Manager } from "../s2/S2Manager";
import { GeohashRange } from "../model/GeohashRange";
import * as Long from "long";
import { PutItemInput, PutRequest, UpdateItemInput } from "aws-sdk/clients/dynamodb";
import { GeoPoint } from "../types";

export class DynamoDBManager {
  private config: GeoDataManagerConfiguration;

  public constructor(config: GeoDataManagerConfiguration) {
    this.config = config;
  }

  /**
   * Query Amazon DynamoDB
   *
   * @param queryInput
   * @param hashKey
   *            Hash key for the query request.
   *
   * @param range
   *            The range of geohashs to query.
   *
   * @return The query result.
   */
  public async queryGeohash(queryInput: DynamoDB.QueryInput | undefined, hashKey: Long, range: GeohashRange): Promise<DynamoDB.QueryOutput[]> {
    const queryOutputs: DynamoDB.QueryOutput[] = [];

    const nextQuery = async (lastEvaluatedKey: DynamoDB.Key = null) => {
      const keyConditions: { [key: string]: DynamoDB.Condition } = {};

      keyConditions[this.config.hashKeyAttributeName] = {
        ComparisonOperator: "EQ",
        AttributeValueList: [{ N: hashKey.toString(10) }]
      };

      const minRange: DynamoDB.AttributeValue = { N: range.rangeMin.toString(10) };
      const maxRange: DynamoDB.AttributeValue = { N: range.rangeMax.toString(10) };

      keyConditions[this.config.geohashAttributeName] = {
        ComparisonOperator: "BETWEEN",
        AttributeValueList: [minRange, maxRange]
      };

      const defaults = {
        TableName: this.config.tableName,
        KeyConditions: keyConditions,
        IndexName: this.config.geohashIndexName,
        ConsistentRead: this.config.consistentRead,
        ReturnConsumedCapacity: "TOTAL",
        ExclusiveStartKey: lastEvaluatedKey
      };

      const queryOutput = await this.config.dynamoDBClient.query({ ...defaults, ...queryInput }).promise();
      queryOutputs.push(queryOutput);
      if (queryOutput.LastEvaluatedKey) {
        return nextQuery(queryOutput.LastEvaluatedKey);
      }
    };

    await nextQuery();
    return queryOutputs;
  }

  public buildPoint(geoPoint: GeoPoint) {
    const geohash = S2Manager.generateGeohash(geoPoint);
    const hashKey = S2Manager.generateHashKey(geohash, this.config.hashKeyLength);
    const item = {};
    item[this.config.hashKeyAttributeName] = { N: hashKey.toString(10) };
    item[this.config.geohashAttributeName] = { N: geohash.toString(10) };
    item[this.config.geoJsonAttributeName] = {
      S: JSON.stringify({
        type: this.config.geoJsonPointType,
        coordinates: (this.config.longitudeFirst ?
          [geoPoint.longitude, geoPoint.latitude] :
          [geoPoint.latitude, geoPoint.longitude])
      })
    };
    return item;
  }

  public putPoint(putPointInput: PutPointInput): Request<PutPointOutput, AWSError> {
    const geohash = S2Manager.generateGeohash(putPointInput.GeoPoint);
    const hashKey = S2Manager.generateHashKey(geohash, this.config.hashKeyLength);
    const putItemInput: PutItemInput = {
      ...putPointInput.PutItemInput,
      TableName: this.config.tableName,
      Item: putPointInput.PutItemInput.Item || {}
    };

    putItemInput.Item[this.config.hashKeyAttributeName] = { N: hashKey.toString(10) };
    putItemInput.Item[this.config.geohashAttributeName] = { N: geohash.toString(10) };
    putItemInput.Item[this.config.geoJsonAttributeName] = {
      S: JSON.stringify({
        type: this.config.geoJsonPointType,
        coordinates: (this.config.longitudeFirst ?
          [putPointInput.GeoPoint.longitude, putPointInput.GeoPoint.latitude] :
          [putPointInput.GeoPoint.latitude, putPointInput.GeoPoint.longitude])
      })
    };

    return this.config.dynamoDBClient.putItem(putItemInput);
  }


  public batchWritePoints(putPointInputs: PutPointInput[]): Request<BatchWritePointOutput, AWSError> {

    const writeInputs: DynamoDB.WriteRequest[] = [];
    putPointInputs.forEach(putPointInput => {
      const geohash = S2Manager.generateGeohash(putPointInput.GeoPoint);
      const hashKey = S2Manager.generateHashKey(geohash, this.config.hashKeyLength);
      const putItemInput = putPointInput.PutItemInput;

      const putRequest: PutRequest = {
        Item: putItemInput.Item || {}
      };

      putRequest.Item[this.config.hashKeyAttributeName] = { N: hashKey.toString(10) };
      putRequest.Item[this.config.geohashAttributeName] = { N: geohash.toString(10) };
      putRequest.Item[this.config.geoJsonAttributeName] = {
        S: JSON.stringify({
          type: this.config.geoJsonPointType,
          coordinates: (this.config.longitudeFirst ?
            [putPointInput.GeoPoint.longitude, putPointInput.GeoPoint.latitude] :
            [putPointInput.GeoPoint.latitude, putPointInput.GeoPoint.longitude])
        })
      };

      writeInputs.push({ PutRequest: putRequest });
    });

    return this.config.dynamoDBClient.batchWriteItem({
      RequestItems: {
        [this.config.tableName]: writeInputs
      }
    });
  }

  public updatePoint(updatePointInput: UpdatePointInput): Request<UpdatePointOutput, AWSError> {
    const pointData = this.buildPoint(updatePointInput.GeoPoint);
    const updateItemInput: UpdateItemInput = {
      TableName: this.config.tableName,
      Key: updatePointInput.Key,
      UpdateExpression: `SET ${this.config.hashKeyAttributeName} = :newHashKey,
          ${this.config.geohashAttributeName} = :newGeoHash,
          ${this.config.geoJsonAttributeName} = :newGeoJson`,
      ExpressionAttributeValues: {
        ':newHashKey' : pointData[this.config.hashKeyAttributeName],
        ':newGeoHash' : pointData[this.config.geohashAttributeName],
        ':newGeoJson' : pointData[this.config.geoJsonAttributeName]
      }
    };
    return this.config.dynamoDBClient.updateItem(updateItemInput);
  }

}
