import numpy as np


def spline_extrapolation(x, y):
    _x = np.array(range(8))
    y = np.array(y)
    step_x = x[1]-x[0]
    step_y = y[1]-y[0]
    new_x = [x[-1]+step_x*(i+1) for i in range(3)]
    new_y = [(y[0]+(new_x[i] - x[0])/step_x*step_y) for i in range(3)]
    extra = [{'x': int(new_x[i]), 'y': int(new_y[i])} for i in range(3)]
    return extra
