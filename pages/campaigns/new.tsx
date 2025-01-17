import React, {useState} from 'react';
import Layout from "../../components/layout";
import {Button, FormField, Form, Message, MessageHeader, Input} from "semantic-ui-react";
import factory from "../../ehereum/factory";
import web3 from "../../ehereum/web3";
import {NextRouter, useRouter} from 'next/router'

const NewCampaign = () => {
    const [minContribution, setMinContribution] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router: NextRouter = useRouter();

    const onSubmit = async(event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        try {
            const accounts = await web3.eth.getAccounts();
            await factory.methods.createCampaign(minContribution).send({from: accounts[0], gas: '1000000'});
            await router.push('/');
        } catch (e) {
            setErrorMessage(e.message);
            setLoading(false);
        }
    }

    // @ts-ignore
    return (
        <Layout>
            <h1>Create a campaign</h1>
            <Form loading={loading} onSubmit={onSubmit} error={Object.keys(errorMessage).length !== 0}>
                <Message error>
                    <MessageHeader>Something went wrong</MessageHeader>
                    <p>{errorMessage}</p>
                </Message>
                <FormField>
                    <label>Min contribution</label>
                    <Input
                        value={minContribution}
                        onChange={e => setMinContribution(e.target.value)}
                    />
                </FormField>
                <Button type='submit'>Submit</Button>
            </Form>
        </Layout>
    );
}

export default NewCampaign;