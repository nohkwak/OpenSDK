import org.web3j.protocol.klaytn.core.method.response.AdminStartHTTPResponse;
import org.web3j.protocol.http.HttpService;
import org.web3j.protocol.klaytn.Web3j;

import java.io.IOException;

public class AdminStartHTTPExample {
    private Web3j w3 = Web3j.build(new HttpService("https://public-en-baobab.klaytn.net"));
    void adminStartHTTPExample() throws IOException {
        String adminHost = "127.0.0.1";
        int port = 8551;
        String cors = "";
        String apis = "klay";
        AdminStartHTTPResponse response = w3.adminStartHTTP(adminHost, port, cors, apis).send();
        response.getResult();
    }
}
