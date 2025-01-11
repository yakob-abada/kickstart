import React, { useState } from "react";
import Layout from "../../../../components/Layout";
import {Button, Form, FormField, Header, Input, Message, MessageHeader} from "semantic-ui-react";
import Campaign from "../../../../ehereum/campaign";
import {useRouter} from "next/router";
import web3 from "../../../../ehereum/web3";

Page.getInitialProps = async ({query}) => {
    return {
        campaignAdd: query.id,
    };
}

export default function Page ({campaignAdd}) {
    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    const [recipient, setRecipient] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onSubmit = async(event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const accounts = await web3.eth.getAccounts();
            const campaign = await Campaign(campaignAdd);
            await campaign.methods.createRequest(description, web3.utils.toWei(value, 'ether'), recipient).send({from: accounts[0], gas: '1000000'});
            await router.push(`/campaigns/${campaignAdd}/requests`);
        } catch (e) {
            setErrorMessage(e.message);
            setLoading(false);
        }
    }

    return (
        <Layout>
            <Header as='h3'>New request for {campaignAdd}</Header>
            <Form loading={loading} onSubmit={onSubmit} error={Object.keys(errorMessage).length !== 0}>
                <Message error>
                    <MessageHeader>Something went wrong</MessageHeader>
                    <p>{errorMessage}</p>
                </Message>
                <FormField>
                    <label>Description</label>
                    <Input
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </FormField>
                <FormField>
                    <label>Value</label>
                    <Input
                        label='ether'
                        labelPosition='right'
                        value={value}
                        onChange={e => setValue(e.target.value)}
                    />
                </FormField>
                <FormField>
                    <label>Recipient</label>
                    <Input
                        value={recipient}
                        onChange={e => setRecipient(e.target.value)}
                    />
                </FormField>
                <Button type='submit'>Submit</Button>
            </Form>
        </Layout>
    )
}