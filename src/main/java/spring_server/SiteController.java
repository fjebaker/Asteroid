package spring_server;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;

import org.apache.commons.io.IOUtils;
import org.springframework.core.io.ResourceLoader;
import org.springframework.beans.factory.annotation.Autowired;
import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Controller
public class SiteController {

	@Autowired
    private ResourceLoader resourceLoader;

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

	private String read_file(String path) {
		String content = "";
		try {
			content = IOUtils.toString(resourceLoader.getResource("file:src/main/web/static/" + path).getInputStream());
		} catch (Exception e) {
			System.out.println(e);
		}
		return content;
	}

    /*@RequestMapping("/test")
    public String test(Model model) {
    	//model.addAttribute("welcome", new Welcome());
        return "test.html";
    }*/

    @RequestMapping("/auth")
    public String auth(Model model) {
        return "html/auth.html";
    }
    @RequestMapping("/home")
    public String home(Model model) {
        return "html/home.html";
    }

    @RequestMapping("/script/{name}.js")
    @ResponseBody
    public String get_script(@PathVariable String name, Model model) {
    	logger.info("GET request for 'script/" + name + ".js'.");
        return read_file("script/" + name + ".js");
    }
}