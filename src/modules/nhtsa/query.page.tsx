import {
	Box, Button,
	Chip,
	FormControl,
	Grid,
	InputLabel,
	MenuItem,
	OutlinedInput, Paper,
	Select,
	Stack, styled,
	Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
	Typography
} from '@mui/material';
import { useEffect, useState } from 'react';

const ToggleSwitch = styled(Switch)(({ theme }) => ({
	width: 28,
	height: 16,
	padding: 0,
	display: 'flex',
	'&:active': {
		'& .MuiSwitch-thumb': {
			width: 15,
		},
		'& .MuiSwitch-switchBase.Mui-checked': {
			transform: 'translateX(9px)',
		},
	},
	'& .MuiSwitch-switchBase': {
		padding: 2,
		'&.Mui-checked': {
			transform: 'translateX(12px)',
			color: '#fff',
			'& + .MuiSwitch-track': {
				opacity: 1,
				backgroundColor: theme.palette.mode === 'dark' ? '#177ddc' : '#1890ff',
			},
		},
	},
	'& .MuiSwitch-thumb': {
		boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
		width: 12,
		height: 12,
		borderRadius: 6,
		transition: theme.transitions.create(['width'], {
			duration: 200,
		}),
	},
	'& .MuiSwitch-track': {
		borderRadius: 16 / 2,
		opacity: 1,
		backgroundColor:
			theme.palette.mode === 'dark' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.25)',
		boxSizing: 'border-box',
	},
}));

const Item = styled(Paper)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
	...theme.typography.body2,
	padding: theme.spacing(1),
	textAlign: 'center',
	color: theme.palette.text.secondary,
}));

interface VehicleTypeResult {
	ElementName: string;
	Id: number;
	Name: string;
}

interface VehicleTypeResponse {
	Count: number;
	Message: string;
	SearchCriteria: string;
	Results: VehicleTypeResult[];
};

interface VehicleMakeResult {
	MakeId: number;
	MakeName: string;
	VehicleTypeId: number;
	VehicleTypeName: string;
}

interface VehicleMakeResponse {
	Count: number;
	Message: string;
	SearchCriteria: string;
	Results: VehicleMakeResult[];
}

interface VehicleModelResult {
	Make_ID: number;
	Make_Name: string;
	Model_ID: number;
	Model_Name: string;
	VehicleTypeId: number;
	VehicleTypeName: string;
}

interface VehicleModelResponse {
	Count: number;
	Message: string;
	SearchCriteria: string;
	Results: VehicleModelResult[];
};

interface VehicleModelResult {
	Make_ID: number;
	Make_Name: string;
	Model_ID: number;
	Model_Name: string;
	VehicleTypeId: number;
	VehicleTypeName: string;
}

let getVehicleTypes = ():Promise<VehicleTypeResponse> => {
	const url = 'https://vpic.nhtsa.dot.gov/api/vehicles/getvehiclevariablevalueslist/vehicle%20type?format=json';

	return fetch(url).then((result) => result.json());
};

let getVehicleMakes = (type:string): Promise<VehicleMakeResponse> => {
	if (!type) return new Promise(() => []);

	const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/${type}?format=json`

	return fetch(url).then((result) => result.json());
};

let getModels = (type:string, makes:number[], year?:string): Promise<VehicleModelResult[]> => {
	let queries:Promise<VehicleModelResponse>[] = [];
	makes.forEach(make => {
		const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeIdYear/makeId/${make}${year ? '/modelyear/' + year : ''}/vehicleType/${type}?format=json`;
		queries.push(fetch(url).then((result) => {
			return result.json();
		}));
	});

	return Promise.all(queries).then((results) => {
		let result:VehicleModelResult[] = [];
		results.forEach(models => result = result.concat(models.Results));
		return result;
	});
};

export default () => {
	const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeResult[]>([]);
	const [vehicleMakes, setVehicleMakes] = useState<VehicleMakeResult[]>([]);

	const [type, setType] = useState<string>('');
	const [makes, setMakes] = useState<number[]>([]);
	const [useYear, setUseYear] = useState<boolean>(false);
	const [year, setYear] = useState<string>('');
	const [isLoadingMakes, setIsLoadingMakes] = useState<boolean>(false);
	const [isLoadingResults, setIsLoadingResults] = useState<boolean>(false);

	const [models, setModels] = useState<VehicleModelResult[]>([]);

	let loadModels = (models:Promise<VehicleModelResult[]>) => {
		models.then(result => setModels(result)).finally(() => {
				setIsLoadingResults(false);
			});
	};

	useEffect(() => {
		setIsLoadingMakes(true);
		// @ts-ignore
		getVehicleTypes().then((types) => {
			if (types) {
				setVehicleTypes(types.Results);
			} else {
				setVehicleTypes([]);
			}
			setIsLoadingMakes(false);
		});
	}, []);

	useEffect(() => {
		// @ts-ignore
		getVehicleMakes(type).then((makes) => {
			setVehicleMakes(makes.Results);
		});
	}, [type]);

	return <div>
		<h1>National Highway Traffic Safety Administrations Vehicle Listing</h1>
		<div className="queryForm">
			<Grid container spacing={2} justifyContent="flex-end">
				<Grid item xs={12}>
					<FormControl sx={{ width: 520 }}>
						<InputLabel id="demo-simple-select-label">Vehicle Type</InputLabel>
						<Select
							labelId="vehicleType-label"
							id="vehicleType-select"
							value={ type }
							label="Vehicle Type"
							onChange={ (e) => setType(e.target.value) }
						>
							{vehicleTypes.map((type) => (
								<MenuItem key={type.Id} value={type.Name}>{type.Name}</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>
				<Grid item xs={12}>
					<FormControl sx={{ width: 520 }}>
						<InputLabel id="vehicleMakes-label">Make</InputLabel>
						<Select
							labelId="vehicleMakes-label"
							id="vehicleMakes-select"
							multiple
							value={ makes }
							// @ts-ignore
							onChange={ (e) => setMakes(e.target.value) }
							input={<OutlinedInput id="vehicleMakes-select" label="Make" />}
							renderValue={(selected) => (
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
									{
										// @ts-ignore
										makes.map((make:number) => (
											<Chip key={make} label={make} />
									))}
								</Box>
							)}
							// MenuProps={MenuProps}
						>
							{ vehicleMakes.map((make:VehicleMakeResult) => (
								<MenuItem
									key={make.MakeId}
									value={make.MakeId}
								>
									{make.MakeName}
								</MenuItem>
							))
							}
						</Select>
					</FormControl>
				</Grid>
				<Grid item xs={12}>
					<Stack direction="row" spacing={1} alignItems="center">
						<Typography>Use Year?</Typography>
						<Typography>No</Typography>
						<ToggleSwitch checked={useYear} onChange={() => setUseYear(!useYear)}/>
						<Typography>Yes</Typography>

						<Box component="form" autoComplete="off">
							<TextField id="outlined-basic" label="" variant="outlined" value={year} onChange={(e) => setYear(e.target.value)}/>
						</Box>
					</Stack>
				</Grid>
				<Grid item xs={12}>
					{ /* @ts-ignore */ }
					<Button disabled={isLoadingResults} variant="contained" onClick={() => {
						setIsLoadingResults(true);
						loadModels(getModels(type, makes, useYear ? year : ''));
					}}>Search</Button>
				</Grid>
			</Grid>
		</div>
		<TableContainer component={Paper}>
			<Table aria-label="simple table">
				<TableHead>
					<TableRow>
						<TableCell>Make ID</TableCell>
						<TableCell align="right">Make Name</TableCell>
						<TableCell align="right">Model ID</TableCell>
						<TableCell align="right">Model Name</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{models.map((model:VehicleModelResult) => (
						<TableRow key={model.Model_ID}>
							<TableCell component="th" scope="row">{model.Make_ID}</TableCell>
							<TableCell align="right">{model.Make_Name}</TableCell>
							<TableCell align="right">{model.Model_ID}</TableCell>
							<TableCell align="right">{model.Model_Name}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	</div>
};
