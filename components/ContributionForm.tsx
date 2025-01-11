import React from "react";
import {Button, Form, FormField, Input, Message, MessageHeader} from "semantic-ui-react";
import web3 from "../ehereum/web3";
import { useState } from 'react'
import Campaign from "../ehereum/campaign";
import { useRouter } from 'next/router'

const ContributionForm = ({address, minContribution}: {address: string, minContribution: number}) => {
    const router = useRouter();
    const [contribution, setContribution] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        try {
            const accounts = await web3.eth.getAccounts();
            const campaign = await Campaign(address)
            await campaign.methods.contribute().send({from: accounts[0], gas: '1000000', value: web3.utils.toWei(contribution, 'ether') });
        } catch (e) {
            setErrorMessage(e.message);
        }
        setLoading(false);
        await router.replace('/campaigns/' + address);
    }

    return (
        <>
            <h3>Contribute to campaign</h3>
            <Form loading={loading} onSubmit={onSubmit} error={Object.keys(errorMessage).length !== 0}>
                <Message error>
                    <MessageHeader>Something went wrong</MessageHeader>
                    <p>{errorMessage}</p>
                </Message>
                <FormField>
                    <label>Contribution with the campaign</label>
                    <Input
                        label="ether"
                        labelPosition="right"
                        placeholder={`Min value is ${minContribution}`}
                        value={contribution}
                        onChange={e => setContribution(e.target.value)}
                    />
                </FormField>
                <Button type='submit'>Submit</Button>
            </Form>
        </>
    )
}

export default ContributionForm;