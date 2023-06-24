## Highlighted chars range

/getStringLength/1-2

```js /getStringLength/1-2
const getStringLength = (str) => str.length;

const strLen = getStringLength('str');

const anotherStrLen = getStringLength('anotherStr');
```

/getStringLength/1,3

```js /getStringLength/1,3
const getStringLength = (str) => str.length;

const strLen = getStringLength('str');

const anotherStrLen = getStringLength('anotherStr');
```

/getStringLength/2,5,6

```js /getStringLength/2,4,6
const getStringLength = (str) => str.length; // getStringLength

const strLen = getStringLength('str'); // getStringLength

const anotherStrLen = getStringLength('anotherStr'); // getStringLength
```
