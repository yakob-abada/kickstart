import Link from 'next/link'
import { MenuItem, MenuMenu, Menu } from 'semantic-ui-react'

export default function Head() {
    return (
        <Menu style={{ margin: '10px 0px' }}>
            <MenuItem link>
                <Link href="/">Yakob</Link>
            </MenuItem>

            <MenuMenu position='right'>
                <MenuItem name='add' link>
                    <Link href="/campaigns/new">Add</Link>
                </MenuItem>
            </MenuMenu>
        </Menu>
    );
}