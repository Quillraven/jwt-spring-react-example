import {Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import {useEffect, useState} from "react";

interface AppTableProps<T, S extends keyof T> {
    data: T[],
    keysToShow: S[]
}

const AppTable = <T, S extends keyof T>({data, keysToShow}: AppTableProps<T, S>) => {
    const [content, setContent] = useState<JSX.Element[]>([])

    const tableCell = (uniqueKey: string, value: any): JSX.Element => {
        if (typeof value === "string") {
            return (<TableCell key={uniqueKey}>{value}</TableCell>)
        } else if (typeof value === "boolean") {
            return (
                <TableCell key={uniqueKey} padding={"checkbox"}>
                    <Checkbox color={"primary"} checked={value} disabled={true}/>
                </TableCell>
            )
        } else if (value instanceof Date) {
            return (
                <TableCell key={uniqueKey}>{`${value.toLocaleDateString()} ${value.toLocaleTimeString()}`}</TableCell>)
        } else if (value === null) {
            return (<TableCell key={uniqueKey}/>)
        } else {
            return (<TableCell key={uniqueKey}>{`Unsupported type for: ${JSON.stringify(value)}`}</TableCell>)
        }
    }

    useEffect(() => {
        if (data?.length > 0) {
            setContent(data.map((item, itemIdx) => {
                const cells = new Array<JSX.Element>()

                keysToShow.forEach((key, keyIdx) => {
                    cells.push(tableCell(`Item-${itemIdx}_Cell-${keyIdx}`, item[key]))
                })

                return (<TableRow key={`Item-Row-${itemIdx}`}>{cells}</TableRow>)
            }))
        }

    }, [data, keysToShow])

    return (
        <TableContainer>
            <Table
                sx={{minWidth: 750}}
                aria-labelledby={"User-Table"}
                size={"small"}
            >
                <TableHead>
                    <TableRow>
                        {keysToShow.map(key => <TableCell key={`TableHeader-${key}`}>{key}</TableCell>)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {content}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default AppTable