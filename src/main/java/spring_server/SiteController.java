package spring_server;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;

@Controller
public class SiteController {

    @RequestMapping("/test")
    public String test(Model model) {
    	//model.addAttribute("welcome", new Welcome());
        return "test.html";
    }
}