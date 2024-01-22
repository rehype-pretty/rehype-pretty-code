## Highlight multiple chars range

/getStringLength/1-2 /str/1,3

```js /getStringLength/1-2 /str/1,3
const getStringLength = (str) => str.length;

const strLen = getStringLength('str');

const anotherStrLen = getStringLength('anotherStr');
```

/getStringLength/ /str/2,3

```js /getStringLength/ /str/2,3
const getStringLength = (str) => str.length;

const strLen = getStringLength('str');

const anotherStrLen = getStringLength('anotherStr');
```

/getStringLength/2 /str/

```js /getStringLength/2 /str/
const getStringLength = (str) => str.length;

const strLen = getStringLength('str');

const anotherStrLen = getStringLength('anotherStr');
```

/Length/1 /str/ /const/2-3 /get/

```js /Length/1 /str/ /const/2-3 /get/
const getStringLength = (str) => str.length;

const strLen = getStringLength('str');

const anotherStrLen = getStringLength('anotherStr');
```