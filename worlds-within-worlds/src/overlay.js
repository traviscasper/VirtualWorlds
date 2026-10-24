// Title/caption compositor (drawn at output resolution so type stays crisp)
function drawOverlay(ctx,items,W,H){
  if(!items) return;
  for(const it of items){
    ctx.save(); ctx.globalAlpha=it.alpha; ctx.textAlign='center'; ctx.textBaseline='middle';
    if(it.kind==='presents'){
      ctx.fillStyle='#cfe6ff'; ctx.font=`300 ${H*.03}px Montserrat, Carlito, "DejaVu Sans", sans-serif`;
      ctx.letterSpacing=`${H*.006}px`; ctx.fillText(it.lines[0],W/2,H*.48);
      ctx.font=`300 ${H*.02}px Montserrat, Carlito, "DejaVu Sans", sans-serif`; ctx.fillStyle='#8fb4e0';
      ctx.fillText(it.lines[1],W/2,H*.535);
    } else if(it.kind==='title'){
      const y=H*(.42-(it.rise||0));
      ctx.shadowColor='rgba(80,170,255,.85)'; ctx.shadowBlur=H*.03;
      ctx.fillStyle='#f4f9ff'; ctx.font=`700 ${H*.12}px Montserrat, Carlito, "DejaVu Sans", sans-serif`;
      ctx.letterSpacing=`${H*.03}px`; ctx.fillText(it.lines[0],W/2+H*.015,y);
      ctx.shadowBlur=H*.012; ctx.shadowColor='rgba(255,190,90,.8)';
      ctx.font=`400 ${H*.034}px Montserrat, Carlito, "DejaVu Sans", sans-serif`; ctx.letterSpacing=`${H*.012}px`;
      ctx.fillStyle='#ffd99a'; ctx.fillText(it.lines[1],W/2+H*.006,y+H*.1);
    } else if(it.kind==='caption'){
      ctx.font=`500 ${H*.032}px Carlito, "DejaVu Sans", sans-serif`; ctx.fillStyle='#fff';
      ctx.shadowColor='#000'; ctx.shadowBlur=6; ctx.fillText(it.text,W/2,H*.9);
    } else if(it.kind==='slate'){
      ctx.fillStyle='rgba(4,8,20,.88)'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#9cc8ff'; ctx.font=`600 ${H*.045}px Carlito, "DejaVu Sans", sans-serif`; ctx.fillText(it.lines[0],W/2,H*.45);
      ctx.fillStyle='#6f8db8'; ctx.font=`400 ${H*.026}px Carlito, "DejaVu Sans", sans-serif`; ctx.fillText(it.lines[1],W/2,H*.53);
    }
    ctx.restore();
  }
}
