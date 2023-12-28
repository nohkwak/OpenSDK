import org.web3j.protocol.klaytn.core.method.response.AdminStateMigrationStatusResponse;
import org.web3j.protocol.http.HttpService;
import org.web3j.protocol.klaytn.Web3j;

import java.io.IOException;

public class AdminStateMigrationStatusExample {
    private Web3j w3 = Web3j.build(new HttpService("https://public-en-baobab.klaytn.net"));
    void adminStateMigrationStatusExample() throws IOException {
        AdminStateMigrationStatusResponse response = w3.adminStateMigrationStatus().send();
        response.getResult();
    }
}
