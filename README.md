# node-fake-server
The easiest way to build a fake-server for your front-ends

# Install
Just type in your terminal:  
```bash
npm install --save node-fake-server
```

# Example
This example helps you understand what does really this project do

```js
import Mock from 'node-fake-server'
// or Mock = require('node-fake-server').default
import Faker from 'faker'

const Videos  = Mock.dataset({
  uuid: Mock.primaryKey(Faker.random.uuid),
  title: Faker.lorem.sentence,
  category: Mock.oneOf('PHP', 'Node.js', 'React', 'React Native'),
  tags: Mock.someOf('fun', 'google', 'summer', 'hello', 'sth', 'how-to')
}, 200)

// A delay is good when you want to test your loading progress
Mock.setDelay(1000)

Mock.get('/latest', Videos.first(4))
Mock.get('/all', Videos)
Mock.get('/top', Videos.random(10))
Mock.get('/videos/:page?', Videos.paginate(10))
Mock.get('/cat/:category/:page?', Videos
  .compareReq('category')
  .paginate(10)
  .only('title')
)
Mock.get('/video/:uuid', Videos
  .uuid()
  .one()
)

Mock.listen(4040)
```

# API
- Mock.setDelay(number|function)  
  Set response delay in ms, if you pass a function it will call it on every request   
- Mock.randomDelay(min = 200, max = 2000)  
  Helper function for setting random delay for each request  
- Mock.raw(data)() -> data  
  Create a function that return the input data back  
- Mock.sendData(data)(req, res, next)  
  Write data to all HTTP requests in an endpoint  
- Mock.sendFile(fileSrc)(req, res, next)  
  Send one file file to all requests in an endpoint  
- Mock.status(status = 'OK')(req, res, next)  
  Send an empty response to requests  
- Mock.sendOneOf(...array)(req, res, next)  
  Send one member of array randomly to request  
- Mock.oneOf(...array)()  
  Select a random element from params
- Mock.someOf(...array)()  
  Create a random sub array from given array  
- Mock.primaryKey(function)
  Use this function in dataset `schema` to set a field as primary key
- Mock.dataset(schema, num)  
  Create a dataset based on given `schema` contains `num` number of created faked entities  
  `schema`: Object(field->func)  
  func is a function that return a random fake data
  you can use `faker.js` library to do the job, look at example   
  `num`: number of elements in dataset  
- For more APIs look at `Express.js` lib :)

# Dataset API:
All of this functions below will return another dataset so you can use chain structure in your code like:
```
Dataset.a().b().c()...(req, res, next)
```
- dataset(req, res, next)
- dataset.filter((entity, index, req) => [True|False])
- dataset.slice(i>=start, end<i)
- dataset.first(n)
- dataset.last(n)
- dataset.paginate(numberOfEntitiesPerPage)  
  This function uses `req.params.page`
- dataset.only(...fields)  
  Imagine `SELECT [fields] FROM ...`
- dataset.one()  
  Return only first data
- dataset.compareReq(field, inObj = field)  
  helper for:
  ```js
  dataset.filter(function(entity, i, req){
    return req.params[field] == entity[inObj]
  })
  ```
- dataset.uuid()  
  helper for `dataset.compareReq('uuid')`
- dataset.random(n = 10)  
  Select n random fields from dataset

> Look at `src/Obj.js` for more informations

# Responses Format
Imagine this schema:
```js
const Videos  = Mock.dataset({
  uuid: Mock.primaryKey(Faker.random.uuid),
  title: Faker.lorem.sentence,
  category: Mock.oneOf('PHP', 'Node.js', 'React', 'React Native')
}, 200)
```
-----

```js
Mock.get('/', Videos.first(2))
```

```json
{
  "status": "OK",
  "entities": [
    {
      "uuid": "0acec3bc-926d-44eb-b944-ecedefce5516",
      "title": "Qui facere occaecati quo omnis asperiores fugiat sunt eius.",
      "category": "Node.js"
    },
    {
      "uuid": "bb290194-718a-47c2-8941-6f554c051c83",
      "title": "Aspernatur possimus aut dolorem consequuntur fuga eos voluptas.",
      "category": "Node.js"
    }
  ]
}
```

-----

```js
Mock.get('/:page?', Videos.only('title').paginate(3))
```

```json
{
  "status": "OK",
  "paginate": {
    "total": 200,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "entities": [
    {
      "title": "Dignissimos quia voluptatibus fugiat."
    },
    {
      "title": "Repudiandae aut et sunt."
    },
    {
      "title": "Doloremque corporis expedita vel."
    }
  ]
}
```

-----

```js
Mock.get('/:uuid?', Videos.uuid().one())
```

```json
{
  "status": "OK",
  "data": {
    "uuid": "d2f3c96a-ccd7-4e2f-b025-39bfe0a9be63",
    "title": "Officiis est repellendus qui expedita.",
    "category": "PHP"
  }
}
```
