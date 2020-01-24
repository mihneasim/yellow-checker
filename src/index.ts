import { Command, flags } from "@oclif/command";
import axios, { AxiosRequestConfig, AxiosPromise } from "axios";
import { JSDOM } from "jsdom";
import * as lineReader from "line-reader";
import * as nodemailer from "nodemailer";
import Mail = require("nodemailer/lib/mailer");

class YellowChecker extends Command {
  static description = "describe the command here";

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: "v" }),
    help: flags.help({ char: "h" }),
    email: flags.string({
      char: "e",
      description: "send price alerts by email to specified address"
    }),
    config: flags.string({
      char: "c",
      description: "override configuration file"
    })
  };

  static args = [{ name: "productSlug" }];

  async checkForProduct(slug: string, threshold: number) {
    const productURL = `https://shop.yellowstore.ro/${slug}`;
    return axios.get(productURL).then(function(response) {
      const root = new JSDOM(response.data);
      const priceDiv = root.window.document.querySelector(
        "div.product-main-price"
      );
      if (priceDiv && priceDiv.childNodes.length) {
        const price = parseInt(
          (priceDiv.childNodes[0].textContent || "0").replace(/[^0-9]/, "")
        );
        console.log(`Price is ${price} vs threshold ${threshold}`);
        if (price < threshold) {
          return `${productURL} has ${price} below ${threshold} threshold`;
        } else return null;
      }
    });
  }

  async run() {
    const { args, flags } = this.parse(YellowChecker);
    let emailTransport: Mail;
    if (flags.email) {
      console.log("initing transport");
      emailTransport = nodemailer.createTransport({
        host: "localhost",
        port: 587,
        secure: false
      });
    }
    const inputFile = args.config || "./configuration";
    lineReader.eachLine(inputFile, line => {
      const [slug, price] = line.split(" ");
      let result = this.checkForProduct(slug, parseFloat(price));
      result.then(value => {
        if (value && flags.email && emailTransport) {
          console.log(`Sending email, contents: ${value}`);
          emailTransport.sendMail(
            {
              from: "youremail@gmail.com",
              to: flags.email,
              subject: "Price Alert",
              text: value
            },
            function(error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log("Email sent: " + info.response);
              }
            }
          );
        }
      });
    });
  }
}

export = YellowChecker;
