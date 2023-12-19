package opensdk.sdk.apis.admin;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.web3j.protocol.klaytn.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.protocol.core.methods.response.admin.AdminNodeConfig;
import opensdk.sdk.apis.constant.UrlConstants;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Admin RPC Test")
class AdminNodeConfigApiTest {
    private Web3j w3 = Web3j.build(new HttpService(UrlConstants.TEST_URL));

    @Test
    @DisplayName("RPC admin_nodeConfig")
    void whenRequestValid_ThenCall200ResponseReturns() throws IOException {
        AdminNodeConfig response = w3.adminNodeConfig().send();

        assertNotNull(response);
        assertNull(response.getError());
        assertNotNull(response.getResult());
    }
}