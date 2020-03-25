import { DynamoDB } from "aws-sdk";

export interface BatchWritePointOutput extends DynamoDB.DocumentClient.BatchWriteItemOutput {
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}
export interface GeoQueryInput {
  QueryInput?: DynamoDB.DocumentClient.QueryInput;
}
export interface GeoQueryOutput extends DynamoDB.DocumentClient.QueryOutput {
}
export interface GetPointInput {
  GeoPoint: GeoPoint;
  GetItemInput: DynamoDB.DocumentClient.GetItemInput;
}
export interface GetPointOutput extends DynamoDB.DocumentClient.GetItemOutput {
}
export interface PutPointInput {
  GeoPoint: GeoPoint;
  PutItemInput: DynamoDB.DocumentClient.PutRequest;
}
export interface PutPointOutput extends DynamoDB.DocumentClient.PutItemOutput {
}
export interface QueryRadiusInput extends GeoQueryInput {
  RadiusInMeter: number;
  CenterPoint: GeoPoint;
}
export interface QueryRadiusOutput extends GeoQueryOutput {
}
export interface QueryRectangleInput extends GeoQueryInput {
  MinPoint: GeoPoint;
  MaxPoint: GeoPoint;
}
export interface QueryRectangleOutput extends GeoQueryOutput {
}
export interface UpdatePointInput {
  Key: DynamoDB.DocumentClient.Key;//DynamoDB.Key,
  GeoPoint: GeoPoint;
  UpdateItemInput: DynamoDB.DocumentClient.UpdateItemInput;
}
export interface UpdatePointOutput extends DynamoDB.DocumentClient.UpdateItemOutput {
}
