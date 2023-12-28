import org.web3j.protocol.klaytn.core.method.response.AdminSetSpamThrottlerWhiteListResponse;
import org.web3j.protocol.http.HttpService;
import org.web3j.protocol.klaytn.Web3j;

import java.io.IOException;
import java.util.List;

public class AdminSetSpamThrottlerWhiteListExample {
    private Web3j w3 = Web3j.build(new HttpService("https://public-en-baobab.klaytn.net"));
    void adminSetSpamThrottlerWhiteListExample() throws IOException {
        List<String> addresses = List.of("0xfdeedbb2fe5b48d5b49e435ba00e0358740d0cf5");
        AdminSetSpamThrottlerWhiteListResponse response = w3.adminSetSpamThrottlerWhiteList(addresses).send();
        response.getResult();
    }
}
