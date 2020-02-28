import { DynamoDB } from "aws-sdk";

export interface BatchWritePointOutput extends DynamoDB.BatchWriteItemOutput {
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}
export interface GeoQueryInput {
  QueryInput?: DynamoDB.QueryInput;
}
export interface GeoQueryOutput extends DynamoDB.QueryOutput {
}
export interface GetPointInput {
  GeoPoint: GeoPoint;
  GetItemInput: DynamoDB.GetItemInput;
}
export interface GetPointOutput extends DynamoDB.GetItemOutput {
}
export interface PutPointInput {
  GeoPoint: GeoPoint;
  PutItemInput: DynamoDB.PutRequest;
}
export interface PutPointOutput extends DynamoDB.PutItemOutput {
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
  Key: DynamoDB.Key,
  GeoPoint: GeoPoint;
  UpdateItemInput: DynamoDB.UpdateItemInput;
}
export interface UpdatePointOutput extends DynamoDB.UpdateItemOutput {
}
