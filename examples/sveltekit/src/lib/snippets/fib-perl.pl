use strict;
use warnings;

my $fib = Fibonacci_sequence();

print $fib->(), "\n"; # 0
print $fib->(), "\n"; # 1

sub Fibonacci_sequence {
    my ($a, $b) = (0, 1);
    return sub {
        my $val = $a;
        ($a, $b) = ($b, $a + $b);
        return $val;
    }
}
