import Layout from "../../components/layout";
import ContributionForm from "../../components/ContributionForm";
import {
    Button,
    Grid,
    GridColumn,
    GridRow,
    Header,
    Segment
} from "semantic-ui-react";
import Campaign from "../../ehereum/campaign";
import web3 from "../../ehereum/web3";
import Link from "next/link";

interface Query {
    id: string
}

Page.getInitialProps = async ({query}: {query: Query}) => {
    const campaign = await Campaign(query.id);
    const summary = await campaign.methods.summary().call();
    return {
        minContribution: summary[0].toString(),
        balance: web3.utils.fromWei(summary[1], 'ether').toString(),
        requestsCount: summary[2].toString(),
        approverCount: summary[3].toString(),
        manager: summary[4],
        campaignAdd: query.id,
    };
}

export default function Page(
    {minContribution, balance, requestsCount, approverCount, campaignAdd}: {
        minContribution: number, balance: number, requestsCount: number, approverCount: number, campaignAdd: string
    }
) {
    return (
        <Layout>
            <Header as='h3'>Campaign details</Header>
            <Grid columns={3} divided>
                <GridRow stretched>
                    <GridColumn>
                        <Segment>
                            <h3>{balance} ether</h3>
                            <p>Campaign balance</p>
                        </Segment>
                        <Segment>
                            <h3>{requestsCount}</h3>
                            <p>Pending Requests</p>
                        </Segment>
                    </GridColumn>
                    <GridColumn>
                        <Segment>
                            <h3>{minContribution}</h3>
                            <p>minContribution</p>
                        </Segment>
                        <Segment>
                            <h3>{approverCount}</h3>
                            <p>Contributors</p>
                        </Segment>
                    </GridColumn>
                    <GridColumn>
                        <ContributionForm address={campaignAdd} minContribution={minContribution} />
                    </GridColumn>
                </GridRow>
                <GridRow>
                    <GridColumn>
                        <Link href={`/campaigns/${campaignAdd}/requests`}>
                            <Button primary icon='list' content='Rquest list'/>
                        </Link>
                    </GridColumn>
                </GridRow>
            </Grid>
        </Layout>
    )
}