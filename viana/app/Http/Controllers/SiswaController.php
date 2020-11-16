<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SiswaController extends Controller
{
       public function index()
    {
  $data['siswa'] = DB::table('siswa')
  ->orderBy('nis', 'asc')
  ->get();
  return view('belajar', $data);
 }
 
 public function create()
 {
  return view('siswa.form');
 }

public function edit(Request $request, $id)
 {
  $data['siswa'] = \DB::table('siswa')->find($id);
  return view('siswa.form', $data);
 }

 public function store(Request $request)
 {
  $rule = [
   'nis' => 'required|unique|numeric',
   'nama_lengkap' => 'required|string',
   'jenkel' => 'required',
   'goldar' => 'required',
  ];
  $this->validate($request, $rule);

  $input = $request->all();
  unset($input['_token']);
  $status = \DB::table('/siswa')->insert($input);

  if($status) {
   return redirect('/siswa')->with('success', 'Data berhasil ditambahkan');
  }
  else {
   return redirect('/siswa/create')->with('error', 'Data gagal ditambahkan');
  }
 }


public function update(Request $request, $id)
 {
  $rule = [
   'nis' => 'required|unique:siswa|numeric',
   'nama_lengkap' => 'required|string',
   'jenkel' => 'required',
   'goldar' => 'required',
  ];
  $this->validate($request, $rule);

  $input = $request->all();
  unset($input['_token']);
  unset($input['_method']);

  $status = \DB::table('siswa')->where('id', $id)->update($input);

  if($status) {
   return redirect('/siswa')->with('success', 'Data berhasil ditambahkan');
  }
  else {
   return redirect('/siswa/create')->with('error', 'Data gagal ditambahkan');
  }
 }

 public function destroy(Request $request, $id)
 {
  $status = \DB::table('siswa')->where('id', $id)->delete();

  if($status) {
   return redirect('/siswa')->with('success', 'Data berhasil dihapus');
  }
  else {
   return redirect('/siswa/create')->with('error', 'Data gagal dihapus');
  }
 }
}