export function* fibbonaciSequence() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibbonaciSequence();
Array.from({ length: 10 }, () => console.log(fib.next().value));
