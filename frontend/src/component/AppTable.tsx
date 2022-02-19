import {Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import {useEffect, useState} from "react";

interface AppTableProps<T, S extends keyof T> {
    data: T[],
    keysToShow: S[]
}

const AppTable = <T, S extends keyof T>({data, keysToShow}: AppTableProps<T, S>) => {
    const [content, setContent] = useState<JSX.Element[]>([])

    const tableCell = (value: any): JSX.Element => {
        if (typeof value === "string") {
            return (<TableCell>{value}</TableCell>)
        } else if (typeof value === "boolean") {
            return (
                <TableCell padding={"checkbox"}>
                    <Checkbox color={"primary"} checked={value} disabled={true}/>
                </TableCell>
            )
        } else if (value instanceof Date) {
            return (<TableCell>{`${value.toLocaleDateString()} ${value.toLocaleTimeString()}`}</TableCell>)
        } else if (value === null) {
            return (<TableCell/>)
        } else {
            return (<TableCell>{`Unsupported type for: ${JSON.stringify(value)}`}</TableCell>)
        }
    }

    useEffect(() => {
        if (data?.length > 0) {
            setContent(data.map(item => {
                const cells = new Array<JSX.Element>()

                keysToShow.forEach(key => {
                    cells.push(tableCell(item[key]))
                })

                return (<TableRow>{cells}</TableRow>)
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
                        {keysToShow.map(header => <TableCell>{header}</TableCell>)}
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