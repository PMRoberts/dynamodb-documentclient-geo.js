/*
 * Copyright 2010-2013 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
import { DynamoDB } from "aws-sdk";
import { S2RegionCoverer } from "nodes2ts";

export class GeoDataManagerConfiguration {

  // Public constants
  static MERGE_THRESHOLD = 2;

  // Configuration properties
  tableName: string;

  consistentRead: boolean = false;

  hashKeyAttributeName: string = "hashKey";
  geohashAttributeName: string = "geohash";
  coordinatesAttributeName: string = "coordinates";

  geohashIndexName: string = "geohash-index";

  projectionExpression: string = null;

  hashKeyLength: number = 2;

  documentClient: DynamoDB.DocumentClient;

  S2RegionCoverer: typeof S2RegionCoverer;

  constructor(documentClient, tableName: string) {
    this.documentClient = documentClient;
    this.tableName = tableName;
    this.S2RegionCoverer = S2RegionCoverer;
  }
}
