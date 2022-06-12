import React from 'react'

const VaultList = ({vaultList}) => {
    return (
        <div>
            <ul>
                {vaultList.map(vault => <li key={vault}>{vault}</li>)}
            </ul>
        </div>
    )
}

export default VaultList
