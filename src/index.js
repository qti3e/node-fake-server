// import Mock from 'node-mock'
// import Faker from 'faker'
//
// const Videos  = Mock.dataset({
//   uuid: Mock.primaryKey(Faker.random.uuid),
//   title: Faker.lorem.sentence
// }, 200)
//
// Mock.setDelay(2000)
// Mock.get('/', Videos.first(4))
// Mock.get('/top', Videos.random(10))
// Mock.get('/videos/:page?', Videos.paginate(20))
// Mock.get('/videos/:category/:page?', Videos
//   .filter(x => Mock.param('category') == x.category)
//   .paginate(20)
//   .only('title')
// )
//
// Mock.listen(4040)

import Express from 'express'
import CORS from 'cors'
import Obj from './Obj'

const app     = Express()
const configs = {delay: 0}
app.use(CORS())

app.use(function(req, res, next){
  let delay = configs.delay
  if(typeof delay == 'function')
    delay = delay()
  if(!delay)
    return next()
  setTimeout(next, delay)
})

app.setDelay = function(num){
  configs.delay = num
}

app.dataset = function(proto, num = 100){
  let obj = new Obj()
  for(let i = 0;i < num;i++){
    let o = {}
    let k = i
    for(let key in proto){
      o[key] = proto[key]()
      if(proto[key].__isPrimary)
        k = o[key]
    }
    obj.push(k, o)
  }
  return obj
}

app.primaryKey = function(method){
  let x = function(){
    return method()
  }
  x.__isPrimary = true
  return x
}

app.oneOf = function(...x){
  return function(){
    return x[Math.floor(Math.random() * x.length)]
  }
}

app.someOf = function(...x){
  return function(){
    let n = Math.floor(Math.random() * x.length)
    let r = () => Math.floor(Math.random() * x.length)
    let ret = new Array(n).fill(null).map(() => r())
    do{
      ret = ret.filter((h, i) => ret.indexOf(h) == i)
      let s = n - ret.length
      for(let i = 0;i < s;i++)
        ret.push(r())
    }while(ret.length < n)
    return ret.map(i => x[i])
  }
}

export default app
