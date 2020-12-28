import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

const logger = createLogger('todos')

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoTable = process.env.TODOS_TABLE,
    private readonly indexName = process.env.TODOS_ID_INDEX) {
  }

  //============================================================
  // Getting all To Do Items
  //============================================================
  async getAllTodoItems(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient.query({
      TableName: this.todoTable,
      IndexName: this.indexName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
          ':userId': userId
      }
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  //============================================================
  // Create To Do
  //============================================================
  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todoTable,
      Item: todoItem
    }).promise()

    return todoItem
  }

  //============================================================
  // Delete To Do
  //============================================================
  async deleteTodo(todoId: string, userId: string ): Promise<void> {
    await this.docClient.delete({
      TableName: this.todoTable,
      Key: {
        todoId,
        userId
    }
    }).promise()   
  }

  //============================================================
  // Update To Do
  //============================================================
  async updateTodoItem(todoId: string, userId: string, todoUpdate: TodoUpdate,  ): Promise<void> {
    await this.docClient.update({
      TableName: this.todoTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: 'set #n = :name, done = :done, dueDate = :dueDate',
      ExpressionAttributeValues: {
        ':name': todoUpdate.name,
        ':done': todoUpdate.done,
        ':dueDate': todoUpdate.dueDate,
      },
      ExpressionAttributeNames: {
        '#n': 'name'
      },
    }).promise()   
  }

  //============================================================
  // Update To Do Url
  //============================================================
  async updateTodoUrl(todoId: string, userId: string): Promise<void> {

    let attachmentUrl: string = 'https://' + process.env.S3_BUCKET + '.s3.amazonaws.com/' + todoId

    logger.info(attachmentUrl);
      
      try {
             
        logger.info("todo id: "+todoId)
        logger.info("user id"+userId)
        
        await this.docClient.update({
          TableName: this.todoTable,
          Key: {
             userId,
             todoId 
          },
          UpdateExpression: "SET attachmentUrl = :attachmentUrl",
          ExpressionAttributeValues: {
            ":attachmentUrl": attachmentUrl
          }            
        }, function(err,data){
            if (err) {
              logger.info(err)
            } else {
              logger.info(data)
        }
        }).promise()

        logger.info("Attachment Update Complete")
  
      }
      catch (err) {
        console.log("Failure: "+err.message)
      } finally {
        console.log("Finally Hit")
      }
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
