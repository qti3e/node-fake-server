let Mock = require('./build').default
let Faker = require('faker')

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
