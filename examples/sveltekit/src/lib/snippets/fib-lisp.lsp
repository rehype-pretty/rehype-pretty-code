(defun fibonacci-generator (n)
  (let ((a 0) (b 1) (next 0))
    (loop for i from 1 to n do
      (setq next (+ a b))
      (setq b a)
      (setq a next)
      (format t "Fibonacci: ~A~%" a))))

(fibonacci-generator 9) ; Print the first 10 Fibonacci numbers
