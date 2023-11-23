from setuptools import setup, find_packages
NAME = "web3py_ext"
VERSION = "0.9.7-beta"
# To install the library, run the following
#
# python setup.py install
#
# prerequisite: setuptools
# http://pypi.python.org/pypi/setuptools

REQUIRES = [
    "web3 ~= 6.3.0"
]

setup(
    name=NAME,
    version=VERSION,
    description="web3klaytn",
    author="Klaytn Foundation",
    author_email="",
    url="https://github.com/klaytn/web3klaytn",
    keywords=["klaytn", "ethereum", "role-based", "multisig"],
    python_requires=">=3.7",
    install_requires=REQUIRES,
    packages=find_packages(exclude=["test", "tests"]),
    include_package_data=True,
    license="MIT",
)