import numpy as np
import random

def spline_extrapolation(x, y):
    # _x = np.array(range(8))
    # y = np.array(y)
    # step_x = x[1]-x[0]
    # step_y = y[1]-y[0]
    # new_x = [x[-1]+step_x*(i+1) for i in range(3)]
    # new_y = [(y[0]+(new_x[i] - x[0])/step_x*step_y) for i in range(3)]
    # extra = [{'x': int(new_x[i]), 'y': int(new_y[i])} for i in range(3)]

    avg_step = 0
    for i in range(1, 5):
        avg_step += x[i] - x[i - 1]
    avg_step = avg_step / 4

    extra = [{'x': x[-1] + avg_step * i, 'y': y[-1] + 3 * random.random() * 2 - 1} for i in range(1, 4)]

    return extra
