defmodule Fibonacci do
  def fib_stream do
    Stream.unfold({0, 1}, fn {a, b} -> {a, {b, a + b}} end)
  end
end

fib = Fibonacci.fib_stream()
Enum.take(fib, 10)

Enum.each(
  Stream.take(fib, 10),
  fn x -> IO.inspect(x, label: "Fibonacci") end
)
