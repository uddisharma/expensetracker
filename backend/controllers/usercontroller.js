const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const mailgen = require("mailgen");

const { Sequelize, DataTypes } = require("sequelize");
const Expense = require("../model/expense");

class UserController {
  static RegisterUser = async (req, res) => {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.json({
        status: 409,
        error: "User already exists.",
        // user: existingUser,
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      User.create({ name, email, password: hashPassword })
        .then((result) => {
          res
            .status(201)
            .json({ status: 201, message: "User registered successfully" });
        })
        .catch((error) => {
          res.status(500).json({ error: error });
        });
    }
  };
  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const user = await User.findOne({ where: { email } });
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (user.email === email && isMatch) {
            const token = jwt.sign({ userID: user.id }, "jwt-secret-token", {
              expiresIn: "5d",
            });
            res.send({
              status: 200,
              message: "Login Success",
              token: token,
              user: user,
            });
          } else {
            res.send({
              status: 500,
              message: "Email or Password is not Valid",
            });
          }
        } else {
          res.send({
            status: "failed",
            message: "You are not a Registered User",
          });
        }
      } else {
        res.send({ status: "failed", message: "All Fields are Required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Unable to Login" });
    }
  };
  static getUsers = async (req, res) => {
    const data = await User.findAll()
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => {
        res.status(500).json({ error: error });
      });
  };
  static deleteUser = async (req, res) => {
    const { id } = req.params;
    User.destroy({ where: { id: id } })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => {
        res.status(500).json({ error: error });
      });
  };
  static getUserByEmail = async (req, res) => {
    const { email } = req.params;
    User.findOne({ where: { email: email } })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  };
  static updatePremiumStatus = async (req, res) => {
    const { id } = req.params;
    User.update({ premium: true }, { where: { id: id } })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  };
  static UserWithExpenseDetails = async (req, res, next) => {
    const { user } = req.params;
    const data = await User.findAll({
      // attributes: [
      //   "id",
      //   "name",
      //   [Sequelize.fn("sum", Sequelize.col("expenseMoney")), "total_amount"],
      // ],
      // include: [
      //   {
      //     model: Expense,
      //     attributes: [],
      //   },
      // ],
      // group: ["id"],
      // order: [["total_amount", "DESC"]],
      attributes: ["id", "name", "totalExpense"],
      group: ["id"],
    })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => {
        res.status(500).json({ error: error });
      });
  };
  static updateUserExpenseDetails = async (req, res, next) => {
    const { id } = req.params;
    const { totalExpense } = req.body;
    console.log(req.body);
    User.update({ totalExpense: totalExpense }, { where: { id: id } })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => {
        res.status(500).json({ error: error });
      });
  };
  static forgotpassword = async (req, res) => {
    const { email } = req.params;
    // console.log(req.params);
    const existingUser = await User.findOne({ where: { email } });
   
    if (existingUser) {
      const secret = existingUser.id + "jwt-secret-token";
      const token = jwt.sign({ userID: existingUser.id }, secret, {
        expiresIn: "15m",
      });
      const link = `http://127.0.0.1:3000/resetpassword/${existingUser.id}/${token}`;
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "uddibhardwaj08@gmail.com", 
          pass: "jjakxuuduudiywaz",
        },
      });
      const mailGenerator = new mailgen({
        theme: "default",
        product: {
          name: "Your App", 
          link: "https://yourapp.com/", 
          logo: "https://yourapp.com/logo.png", 
        },
      });
      const mailOptions = {
        from: "uddibhardwaj08@gmail.com", 
        to: email, 
        subject: "subject",
        html: `<!DOCTYPE html>
          <html
            xmlns="http://www.w3.org/1999/xhtml"
            xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:o="urn:schemas-microsoft-com:office:office"
          >
            <head>
              <title> </title>
              <!--[if !mso]><!-->
              <meta http-equiv="X-UA-Compatible" content="IE=edge" />
              <!--<![endif]-->
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
          
            <body style="word-spacing: normal; background-color: #fafbfc">
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="table-layout: fixed; background-color: #f9f9f9"
                id="bodyTable"
              >
                <tbody>
                  <tr>
                    <td
                      style="padding-right: 10px; padding-left: 10px"
                      align="center"
                      valign="top"
                      id="bodyCell"
                    >
                      <table
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        class="wrapperBody"
                        style="max-width: 600px"
                      >
                        <tbody>
                          <tr>
                            <td align="center" valign="top">
                              <table
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                class="tableCard"
                                style="
                                  background-color: #fff;
                                  border-color: #e5e5e5;
                                  border-style: solid;
                                  border-width: 0 1px 1px 1px;
                                "
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      style="
                                        background-color: #00d2f4;
                                        font-size: 1px;
                                        line-height: 3px;
                                      "
                                      class="topBorder"
                                      height="3"
                                    >
                                      &nbsp;
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      style="padding-top: 60px; padding-bottom: 20px"
                                      align="center"
                                      valign="middle"
                                      class="emailLogo"
                                    >
                                      <a
                                        href="#"
                                        style="text-decoration: none"
                                        target="_blank"
                                      >
                                        <img
                                          alt=""
                                          border="0"
                                          src="https://fitbuzzcare.com/assets/images/logos/logo.png"
                                          style="
                                            width: 100%;
                                            max-width: 150px;
                                            height: auto;
                                            display: block;
                                          "
                                          width="150"
                                        />
                                      </a>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      style="padding-bottom: 20px"
                                      align="center"
                                      valign="top"
                                      class="imgHero"
                                    >
                                      <a
                                        href="#"
                                        style="text-decoration: none"
                                        target="_blank"
                                      >
                                        <img
                                          alt=""
                                          border="0"
                                          src="http://email.aumfusionr.com/vespro/img/hero-img/blue/heroGradient/user-account.png"
                                          style="
                                            width: 100%;
                                            max-width: 600px;
                                            height: auto;
                                            display: block;
                                            color: #f9f9f9;
                                          "
                                          width="600"
                                        />
                                      </a>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      style="
                                        padding-bottom: 45px;
                                        padding-left: 20px;
                                        padding-right: 20px;
                                      "
                                      align="center"
                                      valign="top"
                                      class="mainTitle"
                                    >
                                      <h2
                                        class="text"
                                        style="
                                          color: #000;
                                          font-family: Poppins, Helvetica, Arial,
                                            sans-serif;
                                          font-size: 28px;
                                          font-weight: 500;
                                          font-style: normal;
                                          letter-spacing: normal;
                                          line-height: 36px;
                                          text-transform: none;
                                          text-align: center;
                                          padding: 0;
                                          margin: 0;
                                        "
                                      >
                                        Hi ${existingUser.name}
                                      </h2>
                                    </td>
                                  </tr>
          
                                  <tr>
                                    <td
                                      style="
                                        padding-bottom: 30px;
                                        padding-left: 20px;
                                        padding-right: 20px;
                                      "
                                      align="center"
                                      valign="top"
                                      class="subTitle"
                                    >
                                      <h4
                                        class="text"
                                        style="
                                          color: #999;
                                          font-family: Poppins, Helvetica, Arial,
                                            sans-serif;
                                          font-size: 16px;
                                          font-weight: 500;
                                          font-style: normal;
                                          letter-spacing: normal;
                                          line-height: 24px;
                                          text-transform: none;
                                          text-align: center;
                                          padding: 0;
                                          margin: 0;
                                        "
                                      >
                                        You request to reset the password for your account
                                        has been made at
                                        <a href="https://expensetracker.com/"></a>
                                      </h4>
                                      <br />
                                      <h4
                                        class="text"
                                        style="
                                          color: #999;
                                          font-family: Poppins, Helvetica, Arial,
                                            sans-serif;
                                          font-size: 16px;
                                          font-weight: 500;
                                          font-style: normal;
                                          letter-spacing: normal;
                                          line-height: 24px;
                                          text-transform: none;
                                          text-align: center;
                                          padding: 0;
                                          margin: 0;
                                        "
                                      >
                                        You may now reset the password by clicking the
                                        link below :
                                      </h4>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      style="padding-left: 20px; padding-right: 20px"
                                      align="center"
                                      valign="top"
                                      class="containtTable ui-sortable"
                                    >
                                      <table
                                        border="0"
                                        cellpadding="0"
                                        cellspacing="0"
                                        width="100%"
                                        class="tableButton"
                                        style=""
                                      >
                                        <tbody>
                                          <tr>
                                            <td
                                              style="padding-bottom: 20px"
                                              align="center"
                                              valign="top"
                                            >
                                              <table
                                                border="0"
                                                cellpadding="0"
                                                cellspacing="0"
                                                align="center"
                                              >
                                                <tbody>
                                                  <tr>
                                                    <td
                                                      style="
                                                        background-color: rgb(
                                                          0,
                                                          210,
                                                          244
                                                        );
                                                        height: 50px;
                                                        width: fit-content;
                                                        font-size: 16px;
                                                        padding: 12px 35px;
                                                        border-radius: 50px;
                                                      "
                                                      align="center"
                                                      class="ctaButton"
                                                    >
                                                      <a
                                                        href='${link}'
                                                        style="
                                                          color: #fff;
                                                          font-family: Poppins, Helvetica,
                                                            Arial, sans-serif;
                                                          font-size: 30px;
                                                          font-weight: 600;
                                                          font-style: normal;
                                                          letter-spacing: 1px;
                                                          line-height: 20px;
                                                          text-transform: uppercase;
                                                          text-decoration: none;
                                                          display: block;
                                                        "
                                                        target="_blank"
                                                        class="text"
                                                        >Reset Password</a
                                                      >
                                                    </td>
                                                    <br />
                                                  </tr>
                                                </tbody>
                                              </table>
                                              <br />
                                              <br />
                                              <p
                                                class="text"
                                                style="
                                                  color: #999;
                                                  font-family: Poppins, Helvetica, Arial,
                                                    sans-serif;
                                                  font-size: 16px;
                                                  font-weight: 500;
                                                  font-style: normal;
                                                  letter-spacing: normal;
                                                  line-height: 24px;
                                                  text-transform: none;
                                                  text-align: center;
                                                  padding: 0;
                                                  margin: 0;
                                                "
                                              >
                                                This link can only be used once to log in
                                                and will lead you to a page where you can
                                                set your password. It expires after one
                                                day and nothing will happen if it's not
                                                used.
                                              </p>
                                              <br />
                                              <br />
                                              <p
                                                class="text"
                                                style="
                                                  color: #999;
                                                  font-family: Poppins, Helvetica, Arial,
                                                    sans-serif;
                                                  font-size: 16px;
                                                  font-weight: 500;
                                                  font-style: normal;
                                                  letter-spacing: normal;
                                                  line-height: 24px;
                                                  text-transform: none;
                                                  text-align: center;
                                                  padding: 0;
                                                  margin: 0;
                                                "
                                              >
                                                Thanks!
                                              </p>
                                           
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      style="font-size: 1px; line-height: 1px"
                                      height="20"
                                    >
                                      &nbsp;
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <table
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        class="wrapperFooter"
                        style="max-width: 600px"
                      >
                        <tbody>
                          <tr>
                            <td align="center" valign="top">
                              <table
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                class="footer"
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      style="
                                        padding-top: 10px;
                                        padding-bottom: 10px;
                                        padding-left: 10px;
                                        padding-right: 10px;
                                      "
                                      align="center"
                                      valign="top"
                                      class="socialLinks"
                                    >
                                      <a
                                        href="#facebook-link"
                                        style="display: inline-block"
                                        target="_blank"
                                        class="facebook"
                                      >
                                        <img
                                          alt=""
                                          border="0"
                                          src="http://email.aumfusionr.com/vespro/img/social/light/facebook.png"
                                          style="
                                            height: auto;
                                            width: 100%;
                                            max-width: 40px;
                                            margin-left: 2px;
                                            margin-right: 2px;
                                          "
                                          width="40"
                                        />
                                      </a>
                                      <a
                                        href="#twitter-link"
                                        style="display: inline-block"
                                        target="_blank"
                                        class="twitter"
                                      >
                                        <img
                                          alt=""
                                          border="0"
                                          src="http://email.aumfusionr.com/vespro/img/social/light/twitter.png"
                                          style="
                                            height: auto;
                                            width: 100%;
                                            max-width: 40px;
                                            margin-left: 2px;
                                            margin-right: 2px;
                                          "
                                          width="40"
                                        />
                                      </a>
                                      <a
                                        href="#pintrest-link"
                                        style="display: inline-block"
                                        target="_blank"
                                        class="pintrest"
                                      >
                                        <img
                                          alt=""
                                          border="0"
                                          src="http://email.aumfusionr.com/vespro/img/social/light/pintrest.png"
                                          style="
                                            height: auto;
                                            width: 100%;
                                            max-width: 40px;
                                            margin-left: 2px;
                                            margin-right: 2px;
                                          "
                                          width="40"
                                        />
                                      </a>
                                      <a
                                        href="#instagram-link"
                                        style="display: inline-block"
                                        target="_blank"
                                        class="instagram"
                                      >
                                      
                                      </a>
                                      <a
                                        href="#linkdin-link"
                                        style="display: inline-block"
                                        target="_blank"
                                        class="linkdin"
                                      >
                                        
                                      </a>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      style="padding: 10px 10px 5px"
                                      align="center"
                                      valign="top"
                                      class="brandInfo"
                                    >
                                    
                                    </td>
                                  </tr>
                                  <tr>
                                    
                                  </tr>
                                 
                                
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </body>
          </html>
          `,
      };
      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error("Error sending email:", error);
          return res
            .status(500)
            .json({ success: false, message: "Failed to send email" });
        }
        res
          .status(200)
          .json({ success: true, message: "Email sent successfully" });
      });
    } else {
      res.send("user not found");
    }
  };
  static userPasswordReset = async (req, res) => {
    const { password, password_confirmation } = req.body;
    const { id, token } = req.params;
    const user = await User.findOne({ where: { id: id } });
    const new_secret = user.id + "jwt-secret-token";
    try {
      jwt.verify(token, new_secret);

      const salt = await bcrypt.genSalt(10);
      const newHashPassword = await bcrypt.hash(password, salt);
      await User.update({ password: newHashPassword }, { where: { id: id } });
      res.send({
        status: "success",
        message: "Password Reset Successfully",
      });
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Invalid Token" });
    }
  };
}
module.exports = UserController;
