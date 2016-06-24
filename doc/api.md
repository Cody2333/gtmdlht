- API采用REST API，普通用户通过web和app的操作均通过本套API实现。
- API未特殊说明均以POST方式使用。
- arguments为HTTP请求参数，未特殊说明以POST方式提交。
- return value为JSON，编码为utf-8，实例如下，其中item\*和value\*是定义中的name和其值。未特殊说明，error code为0表示没有错误，-1表示未归类的错误。
- 凡是查询api均有skip和limit两个参数可选，skip表示跳过前面数量为skip的值的条目，limit表示将返回值的条目的数量限制在limit的值以内。

``` json
{
	"err": {
		"code": 0, // error code
		"des”: ""  // error description
	},
	"ret": {
		item0: value0,
		item1: value1,
		...
	}
}
```



## API类型定义

### currency

an integer storing amount of money, one representing CNY 0.01

### timestamp

an integer storing unix timestamp in millisecond

### passenger

| name  | type     | description                 |
| ----- | -------- | --------------------------- |
| id    | objectId | objectId of passenger       |
| name  | string   | name of passenger           |
| phone | string   | phone number of passenger   |
| idnum | string   | ID card number of passenger |

### area

| name     | type     | description             |
| -------- | -------- | ----------------------- |
| id       | objectId | objectId of area        |
| name     | string   | name of                 |
| parentId | objectId | objectId of parent area |

### location

| name      | type     | description           |
| --------- | -------- | --------------------- |
| id        | objectId | objectId of location  |
| cityId    | objectId | objectId of city      |
| name      | string   | name of location      |
| fullName  | string   | full name of location |
| longitude | float    | longitude of location |
| latitude  | float    | latitude of location  |
| note      | string   |                       |

### route

| name         | type     | description                          |
| ------------ | -------- | ------------------------------------ |
| id           | objectId |                                      |
| src          | location | src info                             |
| dest         | location | dest info                            |
| srcFullName  | string   |                                      |
| destFullName | string   |                                      |
| startTime    | date     | departure time                       |
| duration     | integer  | duration of journey (in millisecond) |
| price        | integer  | price of route                       |
| busTypeId    | objectId | objectId of bus type                 |
| personsPaid  | integer  | number of persons that paid          |
| notice       | string   |                                      |

### uncheckedRoute

| name   | type     | description       |
| ------ | -------- | ----------------- |
| id     | objectId |                   |
| userId | objectId | id of the sponsor |
| src    | string   |                   |
| dest   | string   |                   |

### ticket

| name        | type     | description                        |
| ----------- | -------- | ---------------------------------- |
| id          | objectId | objectId of ticket                 |
| code        | string   | ticket code for generating QR code |
| state       | string   |
| passenger | passenger  | objectId of passenger              |
| orderId    | objectId  | id of order                        |
| schedule    | schedule | schedule of ticket                 |

| state      | description     |
| ---------- | --------------- |  
| unused     | 未使用          |
| used      | 使用过了        |  
| discard   | 废弃            |  
### transaction

| name               | type     | description                              |
| ------------------ | -------- | ---------------------------------------- |
| id                 | objectId | objectId of transaction                  |
| chargeId           | objectId | ping++ charge id                         |
| otherId            | objectId | other channel's transaction id if not use ping++ |
| type               | string   | type of transaction                      |
| channel            | string   | payment channel                          |
| currency           | string   | currency type ("cny",...)                |
| orderId            | objectId | objectId of order                        |
| userId             | objectId |                                          |
| transactionQueryId | objectId | objectId of transaction query. null if there is no transaction query |
| amount             | number   | amount of money                          |
| time               | date     | time when this transaction happen        |

#### note

| type     | description           |
| -------- | --------------------- |
| pay      | payment               |
| refund   | refund                |
| withdraw | withdraw user balance |

| channel    | description               |
| ---------- | ------------------------- |
| balance    | account balance           |
| alipay     | Alipay                    |
| alipay_wap | Alipay on web             |
| wx         | WeChat                    |
| wx_pub     | WeChat public account pay |
| upacp      | UnionPay                  |
| upacp_wap  | UnionPay on web           |
|            |                           |

| currency | description  |
| -------- | ------------ |
| cny      | chinese yuan |

### transactionQuery

| attribute | type     | description |
| --------- | -------- | ----------- |
| id        | objectId |             |
| userId    | objectId |             |
| type      | string   |             |
| state     | string   |             |
| orderId   | objectId |             |
| account   | string   | 要打入钱的账户     |
| channel   | string   | 渠道          |
| amount    | number   |             |
| currency  | string   |             |
| createAt  | date     |             |
| doneTime  | date     | 后台处理该请求的时间  |

| type     | description |
| -------- | ----------- |
| refund   | refund      |
| withdraw | withdraw    |

| state     | description |
| --------- | ----------- |
| pending   | pending     |
| finished  | finished    |
| cancelled | cancelled   |

### order

| name           | type        | description                        |
| -------------- | ----------- | ---------------------------------- |
| id             | objectId    | objectId of order                  |
| userId         | objectId    | objectId of user                   |
| orderNumber    | string      | 订单号                              |
| state          | string      | state                              |
| route          | route       | route info                         |
| passengers     | array       |                                    |
| passengers[]   | passenger   |                                    |
| tickets        | array       | if order is unpay, tickets is null |
| tickets[]      | ticket      |                                    |
| coupons        | array       | coupon array                       |
| coupons[]      | coupon      |                                    |
| price          | number      | total price before discount        |
| priceToPay     | number      | the price after discount           |
| transactions   | array       |                                    |
| transactions[] | transaction |                                    |

#### note:

| state      | description      |
| ---------- | ---------------- |
| unpay      | unpay            |
| paying     | paying           |
| paid       | ticket generated |
| finished   | finished         |
| cancelling | cancelling       |
| cancelled  | cancelled        |

### charge

*ping++* charge object

### schedule

| name            | type     | description               |
| --------------- | -------- | ------------------------- |
| id              | objectId |                           |
| route           | route    | route of schedule         |
| driver          | object   |                           |
| driver.name     | string   | driver name               |
| conductor.name  | string   | conductor name            |
| conductor.phone | string   | phone number of conductor |
| plateNumber     | string   | plate number of the bus   |
| seatNumber      | integer  | number of seats           |
| code            | string   |                           |
| cipher          | string   | 暗号                      |
| departureTime   | date     | 出发时间在route里               |

### coupon

| name           | type         | description                              |
| -------------- | ------------ | ---------------------------------------- |
| id             | objectId     |                                          |
| userId         | objectId     |                                          |
| orderId        | objectId     | id of used in the order                  |
| type           | string       |                                          |
| discountCodeId | objectId     | objectId of discount code. Discount code doesn't need to display on the front end |
| discountRule   | DiscountRule |                                          |
| validSource    | location     |                                          |
| validDest      | location     |                                          |
| validStartTime | date         | validStartTime of coupon            |
| validEndTime   | date         | validEndTime of coupon                   |
| validPrice     | number       |                                          |
| discountPrice  | number       |                                          |
| codeNumber     | string       |                                          |

### DiscountCode

| name         | type         | description |
| ------------ | ------------ | ----------- |
| id           | objectId     |             |
| userId       | objectId     |             |
| type         | string       |             |
| discountRule | DiscountRule |             |
| codeNumber   | string       |             |
| validDate    | date         |             |
| curNumber    | number       |             |
| maxNumber    | number       |             |

### DiscountRule

| name             | type     | description                              |
| ---------------- | -------- | ---------------------------------------- |
| id               | objectId |                                          |
| name             | string   |                                          |
| description      | string   |                                          |
| type             | string   |                                          |
| discountFunction | string   | js function 优惠券的价格计算函数: params(discountPrice, priceBefore, totalCoupons) return(moneyToPay) |

#### note:

| type   | description       |
| ------ | ----------------- |
| user   | user code coupon  |
| refund | refund coupon     | 
| public | public coupon     |

backend won't return the coupon which is out of time  

## API定义

### /api/user/prelogin

#### description:

send login SMS

#### arguments:

| name  | type   | description                 |
| ----- | ------ | --------------------------- |
| phone | string | phone number to send SMS to |

#### error code:

| code | description                   |
| ---- | ----------------------------- |
| 1    | incorrect phone number format |
| 2    | SMS sending too frequently    |
| 3    | failed to send SMS            |

### /api/user/login

#### description:

sign up / log in

#### arguments:

| name  | type   | description                   |
| ----- | ------ | ----------------------------- |
| phone | string | phone number SMS sent         |
| code  | string | verification code sent in SMS |

#### error code:

| code | description      |
| ---- | ---------------- |
| 1    | failed to verify |

### /api/user/info

#### description:

return basic info of current user

#### return value:

| name  | type   | description  |
| ----- | ------ | ------------ |
| phone | string | phone number |
| school | location |           |
| home  | location |          |

### /api/user/editLocation

#### description:

edit locations in user info

#### arguments:

| name  | type   | description                   |
| ----- | ------ | ----------------------------- |
| schoolId | string | id of the school location  |
| homeId   | string | id of the home location    |

### /api/user/logout

api for current user to log out

### /api/user/getDiscountCode

get the current user's discount code. if the user doesn't have it, then generate it and return the code.


#### return value:

| name         | type   | description   |
| ------------ | ------ | ------------- |
| discountCode | string | discount code |

#### error code:

| code | description                              |
| ---- | ---------------------------------------- |
| 1    | not login                                |
| 2    | unknown error(I will return an AV.Error in err.info before the app released) |

### /api/passenger/list

#### description:

list passengers under current user

#### return value:

| name         | type      | description |
| ------------ | --------- | ----------- |
| passengers   | array     |             |
| passengers[] | passenger |             |

### /api/passenger/update

#### description:

update passenger info

#### arguments:

| name  | type     | description                              |
| ----- | -------- | ---------------------------------------- |
| id    | objectId | objectId of the passenger needing updating |
| name  | string   | new name of passenger                    |
| phone | string   | new phone number of passenger            |
| idnum | string   | new ID card number of passenger          |

#### note:

unchanged passenger need not listing here.Add new passenger need to use add api.Delete need to use delete api.

### /api/passenger/add

#### description:

add new passenger

#### arguments:

| name  | type   | description |
| ----- | ------ | ----------- |
| name  | string |             |
| phone | string |             |
| idnum | string |             |

#### error code:

| code | description                        |
| ---- | ---------------------------------- |
| 1    | not login                          |
| 2    | unknown error                      |
| 3    | a passenger with same idnum exists |

### /api/passenger/delete

#### description:

delete passenger by objectId  

#### arguments:

| name     | type   | description |
| -------- | ------ | ----------- |
| objectId | string |             |

### /api/area/listAreas

#### description:

list areas

#### argument:

| name               | type   | description              |
| ------------------ | ------ | ------------------------ |
| parentId(optional) | string | parent id of the areas   |
| level              | number | 地区的大小范围，0表示省，1表示市，2表示区/县 |

#### return value:

| name     | type  | description |
| -------- | ----- | ----------- |
| areas    | array |             |
| areas[]  | area  | area info   |

### /api/area/listLocations

#### description:

list locations

#### argument:

| name               | type   | description              |
| ------------------ | ------ | ------------------------ |
| parentId           | string | parent area id    |

#### return value:

| name     | type  | description |
| -------- | ----- | ----------- |
| locations| array |             |
| locations[]  | location  | location info   |

### /api/route/dest/city/list

#### description:

list cities that has destination in it

#### argument:

| name               | type   | description              |
| ------------------ | ------ | ------------------------ |
| parentId(optional) | string | parent id of the areas   |
| level              | number | 地区的大小范围，0表示省，1表示市，2表示区/县 |

#### return value:

| name     | type  | description |
| -------- | ----- | ----------- |
| cities   | array |             |
| cities[] | area  | city info   |

### /api/route/dest/city/srcConnected

#### description:

list cities that connected to the source

#### argument:

| name               | type   | description              |
| ------------------ | ------ | ------------------------ |
| locationId         | string |

#### return value:

| name    | type     | description |
| ------- | -------- | ----------- |
| cities   | array    |             |
| cities[] | area     |             |  

### /api/route/dest/location/srcConnected

#### description:

list locations that connected to the source

#### argument:

| name               | type   | description              |
| ------------------ | ------ | ------------------------ |
| cityId(optional)      | string | id of the source parent area |
| locationId         | string | id of the source location |

#### return value:

| name    | type     | description |
| ------- | -------- | ----------- |
| locations   | array    |             |
| locations[] | location    |             |  


### /api/route/dest/city/subLocationList

#### description:

list locations that has destination in it by their parent city

#### argument:

| name   | type   | description                  |
| ------ | ------ | ---------------------------- |
| cityId | string | parent city of the locations |

#### return value:

| name        | type     | description   |
| ----------- | -------- | ------------- |
| locations   | array    |               |
| locations[] | location | location info |

### /api/route/dest/query

#### description:

query destination

#### arguments:

| name              | type     | description       |
| ----------------- | -------- | ----------------- |
| cityId (optional) | objectId | objectId of city  |
| keywords          | string   | querying keywords |

#### return value:

if only argument `city` is omitted, search in all city and return the dest list; if only argument `keywords` is omitted, return a list of all dest in this city.

| name    | type     | description |
| ------- | -------- | ----------- |
| dests   | array    |             |
| dests[] | location |             |

### /api/route/src/city/list

#### description:

list cities that has source in it

#### argument:

| name               | type   | description              |
| ------------------ | ------ | ------------------------ |
| parentId(optional) | string | parent id of the areas   |
| level              | string | 地区的大小范围，0表示省，1表示市，2表示区/县 |

#### return value:

| name     | type  | description |
| -------- | ----- | ----------- |
| cities   | array |             |
| cities[] | area  | city info   |

### /api/route/src/city/destConnected

#### description:

list cities that connected to the dest

#### argument:

| name               | type   | description              |
| ------------------ | ------ | ------------------------ |
| locationId         | string |

#### return value:

| name    | type     | description |
| ------- | -------- | ----------- |
| cities   | array    |             |
| cities[] | area     |             |  


### /api/route/src/location/destConnected

#### description:

list locations that connected to the dest

#### argument:

| name               | type   | description              |
| ------------------ | ------ | ------------------------ |
| cityId(optional)      | string | id of the source parent area |
| locationId         | string |

#### return value:

| name    | type     | description |
| ------- | -------- | ----------- |
| locations   | array    |             |
| locations[] | location     |             |  


### /api/route/src/city/subLocationList

#### description:

list locations that has source in it by their parent city

#### argument:

| name   | type   | description                  |
| ------ | ------ | ---------------------------- |
| cityId | string | parent city of the locations |

#### return value:

| name        | type     | description   |
| ----------- | -------- | ------------- |
| locations   | array    |               |
| locations[] | location | location info |

### /api/route/src/query

#### description:

query source

#### arguments:

| name              | type     | description       |
| ----------------- | -------- | ----------------- |
| cityId (optional) | objectId | objectId of city  |
| keywords          | string   | querying keywords |

#### return value:

if only argument `city` is omitted, search in all city and return the src list; if only argument `keywords` is omitted, return a list of all src in this city.

| name   | type     | description |
| ------ | -------- | ----------- |
| srcs   | array    |             |
| srcs[] | location |             |

### /api/route/list

#### description:

list routes

### /api/route/view

#### description:

view route info

#### arguments:

| name | type     | description       |
| ---- | -------- | ----------------- |
| id   | objectId | objectId of route |

#### return value:

| name  | type  | description |
| ----- | ----- | ----------- |
| route | route | route info  |

### /api/route/query/keywords

#### description:

query the routes where source contains source keywords and dest contains destination keywords.

#### arguments:

| name           | type   | description          |
| -------------- | ------ | -------------------- |
| src(optional)  | string | source keywords      |
| dest(optional) | string | destination keywords |

#### return value:

| name     | type  | description |
| -------- | ----- | ----------- |
| routes   | array | route list  |
| routes[] | route |             |

### /api/route/query/srcAndDest

#### description:

query the routes by source location id and destination location id.

#### arguments:

| name             | type     | description             |
| ---------------- | -------- | ----------------------- |
| srcId(optional)  | objectId | source location id      |
| destId(optional) | objectId | destination location id |

#### return value:

| name     | type  | description |
| -------- | ----- | ----------- |
| routes   | array | route list  |
| routes[] | route |             |

### /api/route/query/lngAndLat

#### description:

query the routes by source location longitude and latitude and destination location.  

#### arguments:

| name                | type   | description |
| ------------------- | ------ | ----------- |
| srcLng(optional)    | number |             |
| srcLat(optional)    | number |             |
| srcRange(optional)  | number |             |
| destLng(optional)   | number |             |
| destLat(optional)   | number |             |
| destRange(optional) | number |             |

#### return value:

| name     | type  | description |
| -------- | ----- | ----------- |
| routes   | array | route list  |
| routes[] | route |             |

#### note:

The backend will search the route where source longitude is between srcLng +- srcRange and latitude is between srcLat +- srcRange.  

The same to destination.  

If you set the srcLng, you must set srcLat and srcRange.

The same to dest.  

### /api/order/create

#### description:

create order

| name           | type     | description           |
| -------------- | -------- | --------------------- |
| routeId        | objectId | objectId of route     |
| passengersId   | array    |                       |
| passengersId[] | objectId | objectId of passenger |
| couponsId      | array    |                       |
| couponsId[]    | objectId | objectId of coupon    |

#### return value:

| name  | type  | description |
| ----- | ----- | ----------- |
| order | order | order info  |

### /api/order/countPrice

#### description:

count an order's price to pay

| name           | type     | description           |
| -------------- | -------- | --------------------- |
| routeId        | objectId | objectId of route     |
| passengersId   | array    |                       |
| passengersId[] | objectId | objectId of passenger |
| couponsId      | array    |                       |
| couponsId[]    | objectId | objectId of coupon    |

#### return value:

| name  | type  | description |
| ----- | ----- | ----------- |
| price | number | price to pay  |

### /api/order/addCoupons

#### desciption:

apply new coupons to an order. If any one of the coupons is already applied on the order, it will return error   

| name        | type     | description |
| ----------- | -------- | ----------- |
| orderId     | objectId |             |
| couponsId   | array    |             |
| couponsId[] | objectId |             |

#### return value:

| name  | type  | description              |
| ----- | ----- | ------------------------ |
| order | order | order info after updated |

### /api/order/removeCoupons

#### desciption:

remove the applied coupons of the order

| name        | type     | description |
| ----------- | -------- | ----------- |
| orderId     | objectId |             |
| couponsId   | array    |             |
| couponsId[] | objectId |             |

#### return value:

| name  | type  | description              |
| ----- | ----- | ------------------------ |
| order | order | order info after updated |

### /api/order/pay

#### description:

pay order

#### arguments:

| name    | type     | description                              |
| ------- | -------- | ---------------------------------------- |
| orderId | objectId | objectId of order                        |
| channel | string   | payment channel (see also `transaction`) |

#### return value:

| name   | type   | description |
| ------ | ------ | ----------- |
| charge | charge |             |

### /api/order/cancel

#### description:

cancel order

| name    | type     | description       |
| ------- | -------- | ----------------- |
| orderId | objectId | objectId of order |

#### return value:

| name  | type   | description          |
| ----- | ------ | -------------------- |
| state | number | status of cancelling |

note:

| status | description |
| ------ | ----------- |
| 0      | cancelled   |
| 1      | pending     |

### /api/order/list

#### description:

list orders

#### arguments:

| name              | type     | description                              |
| ----------------- | -------- | ---------------------------------------- |
| last (optional)   | objectId | last order to return ordered by creation time in descending order (but itself should not be included; if omitted, return the last orders) |
| number (optional) | number   | number of orders to return (10 if number > 10; 5 if omitted) |

#### return value:

| name     | type  | description |
| -------- | ----- | ----------- |
| orders   | array |             |
| orders[] | order |             |

#### note:

the orders in the list are not full filled with passengers, coupons and tickets

### /api/order/view

#### description:

view order info

#### arguments:

| name    | type     | description       |
| ------- | -------- | ----------------- |
| orderId | objectId | objectId of order |

return value:

| name  | type  | description |
| ----- | ----- | ----------- |
| order | order |             |

### /api/discode/view

description:

view my discount code

#### return value:

| name    | type   | description   |
| ------- | ------ | ------------- |
| discode | string | discount code |

### /api/coupon/redeem

description:

redeem coupon

#### arguments:

| name | type   | description   |
| ---- | ------ | ------------- |
| discode | string | discount code |

#### return value:

| name   | type   | description |
| ------ | ------ | ----------- |
| coupon | coupon |             |

### /api/coupon/list

#### description:

list coupon

#### return value:

| name     | type   | description |
| -------- | ------ | ----------- |
| coupon   | array  |             |
| coupon[] | coupon |             |

### /api/schedule/view

description:

view schedule info

#### arguments:

| name       | type     | description          |
| ---------- | -------- | -------------------- |
| scheduleId | objectId | objectId of schedule |

#### return value:

| name     | type     | description |
| -------- | -------- | ----------- |
| schedule | schedule |             |

### /api/ticket/listByOrder

description:

return tickets in this order

#### arguments:

| name    | type     | description       |
| ------- | -------- | ----------------- |
| orderId | objectId | objectId of order |

return value:

| name      | type   | description |
| --------- | ------ | ----------- |
| tickets   | array  |             |
| tickets[] | ticket |             |

### /api/ticket/listByPhone

#### description:

list tickets with the phone number of current user

#### return value:

| name      | type   | description |
| --------- | ------ | ----------- |
| tickets   | array  |             |
| tickets[] | ticket |             |

### /api/ticket/listByUser

#### description:

list tickets bought by the current user

#### return value:

| name                | type   | description |
| ------------------- | ------ | ----------- |
| tickets             | array  |             |
| tickets[]           | object |             |
| tickets[].route     | object | route info  |
| tickets[].tickets   | array  | tickets     |
| tickets[].tickets[] | object | ticket inf  |

### /api/ticket/view

#### description:

view ticket info

#### arguments:

| name     | type     | description        |
| -------- | -------- | ------------------ |
| ticketId | objectId | objectId of ticket |

#### return value:

| name   | type   | description |
| ------ | ------ | ----------- |
| ticket | ticket |             |

### /api/ticket/use

#### description:

use ticket

#### arguments:

| name       | type     | description        |
| ---------- | -------- | ------------------ |
| ticketId   | array    |                    |
| ticketId[] | objectId | objectId of ticket |

### /api/uncheckedRoute/create

#### description:

create a new route

#### arguments :

| name | type   | description |
| ---- | ------ | ----------- |
| src  | string |             |
| dest | string |             |

### /api/uncheckedRoute/myRoutes

#### description:

list the routes created by the current user

#### return value:

| name              | type            | description |
| ----------------- | --------------- | ----------- |
| uncheckedRoutes   | array           |             |
| uncheckedRoutes[] | uncheckedRoutes |             |
