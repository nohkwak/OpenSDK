import org.web3j.protocol.klaytn.core.method.response.AdminSpamThrottlerConfigResponse;
import org.web3j.protocol.http.HttpService;
import org.web3j.protocol.klaytn.Web3j;

import java.io.IOException;

public class AdminSpamThrottlerConfigExample {
    private Web3j w3 = Web3j.build(new HttpService("https://public-en-baobab.klaytn.net"));
    void adminSpamThrottlerConfigExample() throws IOException {
        AdminSpamThrottlerConfigResponse response = w3.adminSpamThrottlerConfig().send();
        response.getResult();
    }
}
