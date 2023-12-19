import org.web3j.protocol.core.methods.response.admin.AdminNodeConfig;
import org.web3j.protocol.http.HttpService;
import org.web3j.protocol.klaytn.Web3j;

import java.io.IOException;

public class AdminNodeConfigExample {
    private Web3j w3 = Web3j.build(new HttpService("https://public-en-baobab.klaytn.net"));

    void adminNodeConfigExample() throws IOException {
        AdminNodeConfig response = w3.adminNodeConfig().send();
        response.getResult();
    }
}
