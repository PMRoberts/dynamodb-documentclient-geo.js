import { DynamoDBManager } from "../../src/dynamodb/DynamoDBManager";
import { expect } from "chai";
import { GeoDataManagerConfiguration } from "../../src";

describe('DynamoDBManager.putPoint', () => {
  it('calls putItem with the correct arguments ', () => {
    let called = false;
    const config = new GeoDataManagerConfiguration({
      putItem: (args: any) => {
        called = true;
        expect(args).to.deep.equal({
            TableName: 'MyTable',
            Item: {
              geoJson: { S: "{\"type\":\"Point\",\"coordinates\":[-0.13,51.51]}" },
              geohash: { N: "5221366118452580119" },
              hashKey: { N: "52" },
              country: { S: 'UK' },
              capital: { S: 'London' }
            },
            ConditionExpression: "attribute_not_exists(capital)"
          }
        );
      }
    }, 'MyTable');

    const ddb: any = new DynamoDBManager(config);

    ddb.putPoint({
      GeoPoint: { // An object specifying latitutde and longitude as plain numbers. Used to build the geohash, the hashkey and geojson data
        latitude: 51.51,
        longitude: -0.13
      },
      PutItemInput: { // Passed through to the underlying DynamoDB.putItem request. TableName is filled in for you.
        Item: { // The primary key, geohash and geojson data is filled in for you
          country: { S: 'UK' }, // Specify attribute values using { type: value } objects, like the DynamoDB API.
          capital: { S: 'London' }
        },
        ConditionExpression: "attribute_not_exists(capital)"
      }
    });

    expect(called).to.be.true;
  });
});
