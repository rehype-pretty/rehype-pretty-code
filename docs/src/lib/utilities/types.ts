export type NoRepetition<U extends string, ResultT extends Array<any> = []> =
  | ResultT
  | {
      [k in U]: NoRepetition<Exclude<U, k>, [k, ...ResultT]>;
    }[U];
