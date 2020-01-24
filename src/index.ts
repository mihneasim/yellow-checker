import { Command, flags } from "@oclif/command";
import axios, { AxiosRequestConfig, AxiosPromise } from "axios";
import { JSDOM } from "jsdom";
import * as lineReader from "line-reader";

class YellowChecker extends Command {
  static description = "describe the command here";

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: "v" }),
    help: flags.help({ char: "h" }),
    config: flags.string({
      char: "c",
      description: "override configuration file"
    })
  };

  static args = [{ name: "productSlug" }];

  async checkForProduct(slug: string, threshold: number) {
    return axios
      .get(`https://shop.yellowstore.ro/${slug}`)
      .then(function(response) {
        const root = new JSDOM(response.data);
        const priceDiv = root.window.document.querySelector(
          "div.product-main-price"
        );
        if (priceDiv && priceDiv.childNodes.length) {
          const price = parseInt(
            (priceDiv.childNodes[0].textContent || "0").replace(/[^0-9]/, "")
          );
          console.log(`Price is ${price} vs threshold ${threshold}`);
        }
      });
  }

  async run() {
    const { args, flags } = this.parse(YellowChecker);
    const inputFile = args.config || "./configuration";
    lineReader.eachLine(inputFile, line => {
      const [slug, price] = line.split(" ");
      this.checkForProduct(slug, parseFloat(price));
    });
  }
}

export = YellowChecker;
