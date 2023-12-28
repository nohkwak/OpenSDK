import java.io.IOException;

import org.web3j.protocol.klaytn.core.method.response.KlaySyncingResponse;
import org.web3j.protocol.http.HttpService;
import org.web3j.protocol.klaytn.Web3j;

public class KlaySyncingExample {
    private Web3j w3 = Web3j.build(new HttpService("https://public-en-baobab.klaytn.net"));  void klaySyncingExample() throws IOException {
    KlaySyncingResponse response = w3.klaySyncing().send();
    response.getResult();
  }
}
