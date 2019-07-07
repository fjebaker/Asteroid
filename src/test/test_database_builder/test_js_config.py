"""Test the JSConfig.build method.
"""
import pytest
import src.main.databasebuilder.JSConfig as JSConfig


def test_build_with_dict():
    """Test build runs successfully with a dict argument."""
    config = {"dictionary": 1}
    JSConfig.build(config)


def test_build_throws_typeerror_non_dict():
    """Test if a TypeError is thrown when build runs
    with a non-dict argument"""
    config = -1
    with pytest.raises(TypeError):
        JSConfig.build(config)
