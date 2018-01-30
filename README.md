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
  set response delay in ms, if you pass a function it will call it on every request   
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
  "entities": {
    "0acec3bc-926d-44eb-b944-ecedefce5516": {
      "uuid": "0acec3bc-926d-44eb-b944-ecedefce5516",
      "title": "Qui facere occaecati quo omnis asperiores fugiat sunt eius.",
      "category": "Node.js"
    },
    "bb290194-718a-47c2-8941-6f554c051c83": {
      "uuid": "bb290194-718a-47c2-8941-6f554c051c83",
      "title": "Aspernatur possimus aut dolorem consequuntur fuga eos voluptas.",
      "category": "Node.js"
    }
  }
}
```

-----

```js
Mock.get('/:page?', Videos.only('title').paginate(3))
```

```json
{
  "paginate": {
    "total": 200,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "entities": {
    "5b15a187-8514-4135-af18-04132ffaca80": {
      "title": "Dignissimos quia voluptatibus fugiat."
    },
    "1660453f-29bc-4b30-b5e1-cc19e464c482": {
      "title": "Repudiandae aut et sunt."
    },
    "4a900aba-4669-4aaa-811c-cdb97debe141": {
      "title": "Doloremque corporis expedita vel."
    }
  }
}
```

-----

```js
Mock.get('/:uuid?', Videos.uuid().one())
```

```json
{
  "data": {
    "uuid": "d2f3c96a-ccd7-4e2f-b025-39bfe0a9be63",
    "title": "Officiis est repellendus qui expedita.",
    "category": "PHP"
  }
}
```
