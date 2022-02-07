#!/usr/bin/env python
# -*- coding: utf-8 -*-

from distutils.core import setup
from catkin_pkg.python_setup import generate_distutils_setup


setup_args = generate_distutils_setup(
    packages=['my_robot_description'],
    scripts=['/scripts'],
    package_dir={'': 'src'}
)

setup(**setup_args)