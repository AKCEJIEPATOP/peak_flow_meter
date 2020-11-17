from scipy.interpolate import UnivariateSpline
import numpy as np


def spline_extrapolation(x, y, base):
    x = [i - base for i in x]
    x = np.array(x)
    y = np.array(y)
    step = x[-1]-x[-2]
    new_x = [x[-1]+step*(i+1) for i in range(3)]
    spline = UnivariateSpline(x, y, k=1)
    new_y = spline(new_x)
    extra = [{'x': int(new_x[i]+base), 'y': int(new_y[i])} for i in range(3)]
    return extra
