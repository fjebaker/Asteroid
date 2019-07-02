"""Test the JSConfig class.
"""
import pytest
import src.main.databasebuilder.JSConfig as JSConfig


class TestJSConfiger:
    """Test the JSConfiger class.
    """

    def test_init_with_dictionary(self):
        """Test JSConfiger initialises with a dict argument."""
        config = {"dictionary": 1}
        configer = JSConfig.JSConfiger(config)
        assert configer is not None

    def test_init_with_non_dictionary(self):
        """Test if a TypeError is thrown when JSConfiger is initialised
        with a non-dict argument"""
        config = -1
        with pytest.raises(TypeError):
            JSConfig.JSConfiger(config)
