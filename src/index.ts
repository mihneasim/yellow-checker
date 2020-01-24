import { Command, flags } from "@oclif/command";
import axios, { AxiosRequestConfig, AxiosPromise } from "axios";
import { JSDOM } from "jsdom";

class YellowChecker extends Command {
  static description = "describe the command here";

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: "v" }),
    help: flags.help({ char: "h" })
  };

  static args = [{ name: "productSlug" }];

  async run() {
    const { args, flags } = this.parse(YellowChecker);
    axios
      .get(`https://shop.yellowstore.ro/${args.productSlug}`)
      .then(function(response) {
        const root = new JSDOM(response.data);
        const priceDiv = root.window.document.querySelector(
          "div.product-main-price"
        );
        if (priceDiv && priceDiv.childNodes.length) {
          const price = parseInt(
            (priceDiv.childNodes[0].textContent || "0").replace(/[^0-9]/, "")
          );
          console.log(`Price is ${price}`);
        }
      });
  }
}

export = YellowChecker;
