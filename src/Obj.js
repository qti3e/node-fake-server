import clone from 'clone'

function Obj(){
  let ret = (req, res, next) => {
    let keys = Object.keys(ret.data)
    ret.req = req
    for(let j = 0;j < ret.filters.length;j++){
      ret.len = keys.length
      keys = keys.filter((key, i) =>
        ret.filters[j].call(ret, ret.data[key], i, req)
      )
    }

    let _data_ = clone(ret.data)

    if(ret._only_){
      for(let primaryKey in _data_){
        if(keys.indexOf(primaryKey) < 0){
          _data_[primaryKey] = null
          continue
        }
        let t = {}
        for(let i in ret._only_){
          t[ret._only_[i]] = _data_[primaryKey][ret._only_[i]]
        }
        _data_[primaryKey] = t
      }
    }

    if(ret._one_){
      ret.response.data = keys[0] ? _data_[keys[0]] : null
    }else{
      let data = {}
      for(let i in keys){
        data[keys[i]] = _data_[keys[i]]
      }
      ret.response.entities = data
    }

    res.send(ret.response)
  }

  ret.data     = {}
  ret.filters  = []
  ret.response = {}
  ret._one_    = false
  ret._only_   = null

  this.clone = () => {
    let tmp = new Obj()
    tmp.data      = ret.data
    tmp.filters   = clone(ret.filters)
    tmp.response  = clone(ret.response)
    tmp._one_     = ret._one_
    tmp._only_    = ret._only_
    return tmp
  }

  ret.push = (primaryKey, obj) => {
    ret.data[primaryKey] = obj
  }

  ret.filter = filter => {
    let tmp = this.clone()
    tmp.filters.push(filter)
    return tmp
  }

  ret.slice = (start, end = Infinity) => ret.filter(function(x, i){
    if(start < 0)
      start = this.len + start
    if(end < 0)
      end = this.len + end
    return i >= start && i < end
  })

  ret.first = n => ret.slice(0, n)

  ret.last = n => ret.slice(-n)

  ret.paginate = (n = 10) => ret.filter(function(x, i, req){
    if(!req.params.page)
      req.params.page = 0
    let s = req.params.page * n
      , e = req.params.page * n + n
    if(!this.response.paginate){
      this.response.paginate = {
        total: this.len,
        hasNextPage: this.len >= e,
        hasPrevPage: parseInt(req.params.page) > 0
      }
    }
    return i >= s && i < e
  })

  ret.only = (...fields) => {
    ret._only_ = fields
    return ret
  }

  ret.one = () => {
    ret._one_ = true
    return ret
  }

  ret.compareReq = (field, inObj = field) => ret.filter(function(x, i, req){
    return req.params[field] == x[inObj]
  })

  ret.uuid = () => ret.compareReq('uuid')

  ret.random = (num = 10) => ret.filter(function(x, i, req){
    if(i == 0){
      let n = Math.min(num, this.len)
      let r = () => Math.floor(Math.random() * this.len)
      let x = new Array(n).fill(null).map(() => r())
      x = x.filter((h, i) => x.indexOf(h) == i)
      while(x.length < n){
        let s = n - x.length
        for(let i = 0;i < s;i++)
          x.push(r())
        x = x.filter((h, i) => x.indexOf(h) == i)
      }
      this.__sRandom = x
    }
    let _r_ = this.__sRandom.indexOf(i) > -1
    if(i === this.len - 1){
      this.__sRandom = null
    }
    return _r_
  })

  return ret
}

export default Obj
