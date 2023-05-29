import { ConnectContactFlowEvent, Context, Handler, KinesisStreamEvent } from "aws-lambda";
import { Connect, DynamoDB } from "aws-sdk";
import { dynamodb } from "./functions/dynamodb/client";
import { connect } from "./functions/amazonConnect/connect";


const instanceId: string = 'arn:aws:connect:ap-southeast-2:312734942162:instance/ba13a334-0329-4bc8-9544-a82b970effaf';

export const handler: Handler = async (event: ConnectContactFlowEvent, context: Context) => {
    console.log('Lambda event payload:', event);
    // TODO: handle records
    if (!isContactFlow(event)) return;
    const phoneNumber = event.Details.ContactData.CustomerEndpoint.Address;
    console.log('Customer phonenumber is: ', phoneNumber);
    const queryParam: DynamoDB.DocumentClient.QueryInput = {
        TableName: 'nab-climate-change',
        KeyConditionExpression: '#phoneNumber = :phoneNumber',
        ExpressionAttributeNames: {
            '#phoneNumber': 'phoneNumber',
        },
        ExpressionAttributeValues: {
            ':phoneNumber': phoneNumber,
        },
    };
    const queryData = await dynamodb.query(queryParam).promise();
    if (queryData.Items.length !== 0) {
        return {
            'greenFlag': 'true',
        }
    } return {
        'greenFlag': 'false',
    }
}

function isContactFlow(event: any): event is KinesisStreamEvent {
    return (
        Boolean(event.Name === 'ContactFlowEvent')
    );
}
