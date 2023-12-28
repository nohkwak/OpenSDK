import org.web3j.protocol.core.methods.response.admin.AdminPeers;
import org.web3j.protocol.http.HttpService;
import org.web3j.protocol.klaytn.Web3j;

import java.io.IOException;

public class AdminPeersExample {
    private Web3j w3 = Web3j.build(new HttpService("https://public-en-baobab.klaytn.net"));
    void adminPeersExample() throws IOException {
        AdminPeers response = w3.adminPeers().send();
        response.getResult();
    }
}
