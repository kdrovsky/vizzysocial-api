import express from 'express';
import dotenv from 'dotenv';
import chargebee from 'chargebee'
import { removeEmojis } from '../helper_functions.js';

dotenv.config({ path: '.env' });
const router = express.Router();

chargebee.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEBEE_API_KEY
  });


router.post("/generate_checkout_new_url", (req, res) => {
    chargebee.hosted_page.checkout_new_for_items({
        subscription_items:
            [{
                item_price_id: req?.body?.plan_id,
                item_price_price: '9995',
                currency_code: 'USD',
                quantity: 1,
            }]
    }).request(function (error, result) {
        if (error) {
            //handle error
            console.log(error);
            // res.send(error);
        } else {
            res.send(result.hosted_page);
        }
    });
});

router.post("/cancel_for_items", (req, res) => {
    chargebee.subscription.cancel_for_items(req.body.subscription_item_id, {
        end_of_term: false
    }).request(function (error, result) {
        if (error) {
            //handle error
            console.log(error);
        } else {
            // console.log(result);
            var subscription = result.subscription;
            var customer = result.customer;
            var card = result.card;
            var invoice = result.invoice;
            var unbilled_charges = result.unbilled_charges;
            var credit_notes = result.credit_notes;
            res.send(card, invoice, credit_notes, subscription, customer, unbilled_charges)
        }
    });
});

router.post("/create_customer", (req, res) => {
    chargebee.customer.create({
        first_name: removeEmojis(req.body.first_name),
        last_name: req.body.last_name,
        allow_direct_debit: req.body.allow_direct_debit,
        email: req.body.email,
        // payment_method: {
        //   gateway_account_id : "gw_B8OVRZTUbPV512",
        //   type: "card",
        //   token_id: req.body.token_id
        // }
    }).request(function (error, result) {
        if (error) {
            //handle error
            console.log("Error while executing create_customer()");
            console.log(error);
            res.send({ message: 'error', error })
        } else {
            // console.log(result);
            var customer = result.customer;
            // var card = result.card;
            // console.log(card);

            // create payment_source
            chargebee.payment_source.create_using_token({
                customer_id: customer.id,
                token_id: req.body.token_id
            }).request(function (error, result) {
                if (error) {
                    //handle error
                    console.log("Error while executing payment_source()");
                    console.log(error);
                    res.send({ message: 'error', error })
                } else {
                    // console.log(result);
                    var customer = result.customer;
                    var payment_source = result.payment_source;
                    res.send({ message: 'success', customer, payment_source })
                }
            });
        }
    });
});

router.post("/customer_list", (req, res) => {
    chargebee.customer.list({
        limit: 1,
        "email[is]": req.body.email
    }).request(function (error, result) {
        if (error) {
            //handle error
            // console.log(error);
            res.send({})
        } else {
            var customer = {};
            for (var i = 0; i < result.list.length; i++) {
                var entry = result.list[i]
                // console.log(entry);
                customer = entry.customer;
                // var card = entry.card;
            }
            // console.log(customer);
            // console.log(result);
            // const customer = result.customer
            res.send(customer)
        }
    });
});

router.post("/create_subscription_for_customer", (req, res) => {
    chargebee.subscription.create_with_items(req.body.customer_id, {
        subscription_items:
            [{
                item_price_id: req?.body?.plan_id,
                item_price_price: '9995',
                currency_code: 'USD',
                quantity: 1,
            }]
    }).request(function (error, result) {
        if (error) {
            //handle error
            // console.log(error);
            res.send({ message: 'error', error })
        } else {
            // console.log(result);
            // var subscription = result.subscription;
            // var customer = result.customer;
            // var card = result.card;
            // var invoice = result.invoice;
            // var unbilled_charges = result.unbilled_charges;
            res.send({ message: 'success', result })
        }
    });
})

router.post("/subscription_list", (req, res) => {
    chargebee.subscription.list({
        limit: 1,
        "customer_id[is]": req.body.customer_id,
    }).request(function (error, result) {
        if (error) {
            //handle error
            console.log(error);
        } else {
            var customer_subscription = {};
            // console.log(result?.list?.[0]?.subscription);
            for (var i = 0; i < result.list.length; i++) {
                var entry = result.list[i]
                customer_subscription = entry.subscription;
            }
            // console.log(customer_subscription);
            res.send(customer_subscription)
        }
    });
});

router.post("/pre_cancel", (req, res) => {
    chargebee.hosted_page.pre_cancel({
        // pass_thru_content: "{custom :  {discount_percent: 10}}",
        subscription: {
            // id: "__test__KyVnHhSBWmCoF2tJ"
            // id: "__live__B8NglNTUdZxSWoD"
            id: "B8NglNTUdZxSWoD"
        },
        // cancel_url: 'https//sprouty-social.vercel.app'
    }).request(function (error, result) {
        if (error) {
            //handle error
            console.log(error);
            // res.send(error);
        } else {
            // console.log(result);
            res.send(result.hosted_page);
        }
    });
});

router.post("/generate_checkout_existing_url", (req, res) => {
    chargebee.hosted_page.checkout_existing({
        subscription: {
            // id : "1mhuIhIQhDeD9KFIJ"
            id: req.body.page_id
        },
    }).request(function (error, result) {
        if (error) {
            //handle error
            console.log(error);
        } else {
            res.send(result.hosted_page);
        }
    });
});

router.post("/generate_update_payment_method_url", (req, res) => {
    chargebee.hosted_page.manage_payment_sources({
        customer: {
            id: req.body.customer_id
        },
    }).request(function (error, result) {
        if (error) {
            //handle error
            console.log(error);
        } else {
            res.send(result.hosted_page);
        }
    });
});

router.post("/generate_portal_session", (req, res) => {
    chargebee.portal_session.create({
        customer: {
            id: req.body.customer_id
        },
    }).request(function (error, result) {
        if (error) {
            //handle error
            console.log(error);
        } else {
            res.send(result.portal_session);
        }
    });
});

router.post('/generate_payment_intent', (req, res) => {
    chargebee.payment_intent.create(req.body)
        .request(function (error, result) {
            if (error) {
                res.status(error.http_status_code || 500);
                res.json(error);
            } else {
                res.json(result);
            }
        });
});

router.post('/retrieve_customer', async (req, res) => {
    const customerId = req.body.customerId
    // console.log(customerId);
    const customer = await chargebee.customer.retrieve(customerId).request().catch(err => {
        return { message: 'error', err }
    })

    // console.log(customer);

    if (customer.message === 'error') {
        console.log("error while executing retrieve_customer(): ");
        console.log(customer?.err);
        res.status(customer?.err?.http_status_code || 500);
        res.json(customer?.err);
        return;
    }
    const paymentSources = await getPaymentSourcesForCustomer(customerId)
    res.json({ ...customer, paymentSources });
    // res.json(customer);
});

router.post("/create_subscription", async (req, res) => {
    const createSubscription = await create_subscription(req?.body?.customer_id, req?.body?.plan_id)
    res.send(createSubscription)
});

router.post("/create_customer_and_subscription", async (req, res) => {
    // const token_id = req.body.token_id
    const customerRes = await create_customer(req.body)
    if (customerRes.message === "success") {
        var customer = customerRes.customer;
        const createSubscription = await create_subscription(customer?.id, req?.body?.plan_id)
        res.send(createSubscription)
    } else {
        console.log(customerRes);
        res.status(customerRes?.result?.http_status_code || 500);
        res.json(customerRes.result);
    }
});

router.post('/updateCustomerPaymentMethod', async (req, res) => {
    const customer_id = req.body.customer_id
    const token_id = req.body.token_id
    const result = await chargebee.payment_source.create_using_token({ customer_id, token_id }).request().catch(err => {
        return ({ message: 'error', err })
    })
    if (result.message === 'error') {
        console.log("error while executing updateCustomerPaymentMethod(): ");
        res.status(result?.err?.http_status_code || 500);
        res.json(result?.err);
        return;
    }
    res.json(result);
});

async function getPaymentSourcesForCustomer(customer_id) {
    const result = await chargebee.payment_source.list({
        limit: 100,
        "type[is]": "card",
        "customer_id[is]": customer_id
    }).request().catch(err => {
        return ({ message: 'error', err })
    });
    if (result.message === 'error') {
        return ({ message: 'error', result })
    } else {
        return ({ message: "success", result });
    }
}

async function create_customer(body) {
    const result = await chargebee.customer.create({
        first_name: removeEmojis(body.first_name),
        last_name: body.last_name,
        allow_direct_debit: body.allow_direct_debit,
        email: body.email,
        token_id: body.token_id
        // payment_method: [{
        //   type: "card",
        // }]
    }).request().catch(err => {
        console.log("Error while executing create_customer()");
        return ({ message: 'error', err })
    })
    if (result.message === 'error') {
        return ({ message: 'error', result })
    } else {
        const { customer } = result
        return ({ message: "success", customer });
    }
}

// async function create_payment_source_using_token(token_id, customer_id) {
//   const result = await chargebee.payment_source.create_using_token({ customer_id, token_id }).request().catch(err => {
//     return ({ message: 'error', err })
//   })
//   if (result.message === 'error') {
//     console.log("Error while executing create_payment_source_using_token()");
//     return ({ message: 'error', result })
//   }
//   const { customer, payment_source } = result
//   return ({ message: "success", customer, payment_source });
// }

async function create_subscription(customer_id, plan_id) {
    const result = await chargebee.subscription.create_with_items(
        customer_id, {
        subscription_items:
            [{
                item_price_id: plan_id,
                item_price_price: '9995',
                currency_code: 'USD',
                quantity: 1,
            }]
    }
    ).request().catch(err => {
        console.log("Error while executing create_subscription()");
        console.log(err);
        return ({ message: 'error', err })
    })
    if (result.message === 'error') {
        return ({ message: 'error', result })
    }
    // var subscription = result.subscription;
    // var customer = result.customer;
    // var card = result.card;
    // var invoice = result.invoice;
    // var unbilled_charges = result.unbilled_charges;
    return ({ message: 'success', result });
}

export default router