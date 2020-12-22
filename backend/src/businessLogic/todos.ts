import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'
import { createLogger } from '../../src/utils/logger'

const logger = createLogger('todos')

const todoAccess = new TodoAccess()

//============================================================
// Getting all To Do Items
//============================================================
export async function getTodos(jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken)
  return todoAccess.getAllTodoItems(userId)
}

//============================================================
// Create To Do
//============================================================
export async function createTodo(
  CreateTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await todoAccess.createTodo({
    todoId: itemId,
    createdAt: new Date().toISOString(),
    name: CreateTodoRequest.name,
    dueDate: CreateTodoRequest.dueDate,
    userId: userId,
    done: false
  })
}

//============================================================
// Delete To Do
//============================================================
export async function deleteTodo(
  todoId: string,
  jwtToken: string
): Promise<void> {

  const userId = parseUserId(jwtToken)
  await todoAccess.deleteTodo(todoId, userId)
}

//============================================================
// Update To Do
//============================================================
export async function updateTodoItem(
  todoId: string,
  UpdateTodoRequest: UpdateTodoRequest,
  jwtToken: string
): Promise<void> {

  const userId = parseUserId(jwtToken)
  logger.info("User ID:"+userId);

  await todoAccess.updateTodoItem(todoId, userId, UpdateTodoRequest)

}

//============================================================
// Update To Do Url
//============================================================
export async function updateTodoUrl(
  todoId: string,
  jwtToken: string
): Promise<void> {

  const userId = parseUserId(jwtToken)
  logger.info("User ID:"+userId);

  logger.info("Start business Logic Call")
  await todoAccess.updateTodoUrl(todoId, userId)
  logger.info("End business Logic Call")

}