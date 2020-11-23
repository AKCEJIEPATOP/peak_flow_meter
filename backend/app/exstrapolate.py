import numpy as np
from sklearn.linear_model import LinearRegression


def extrapolation(x, y):
    x = np.array(x).reshape(-1, 1)
    y = np.array(y).reshape(-1, 1)
    step_x = x[1]-x[0]
    new_x = [x[-1]+step_x*(i+1) for i in range(3)]
    new_x = np.array(new_x).reshape(-1, 1)
    weights = np.ones_like(x).reshape(-1)
    weights[-2] = 2
    weights[-1] = 4
    lr = LinearRegression()
    print(weights)
    lr.fit(x, y, weights)
    new_y = lr.predict(new_x)

    extra = [{'x': int(new_x[i]), 'y': int(new_y[i])} for i in range(3)]
    return extra
